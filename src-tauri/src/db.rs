//! Talk to a real database: run SQL and return every value as text (good for a results grid).
//! One short-lived connection per call; nothing is cached or stored. Passwords only live in the URL
//! the frontend sends for that call.

use futures_util::TryStreamExt;
use serde::Serialize;
use sqlx::{Column, Connection, Either, Executor, Row};
use std::time::{Duration, Instant};

const CONNECT_TIMEOUT: Duration = Duration::from_secs(15);
const QUERY_TIMEOUT: Duration = Duration::from_secs(120);

#[derive(Debug, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct QueryResult {
    /// Columns of the last statement that returned rows.
    pub columns: Vec<String>,
    pub rows: Vec<Vec<Option<String>>>,
    /// Rows changed by INSERT / UPDATE / DELETE (all statements).
    pub rows_affected: u64,
    /// More rows existed than `max_rows`.
    pub truncated: bool,
    pub elapsed_ms: u64,
}

#[derive(Debug, Clone, Copy, PartialEq)]
enum Kind {
    Postgres,
    MySql,
    Sqlite,
}

fn kind_of(url: &str) -> Result<Kind, String> {
    let scheme = url.split(':').next().unwrap_or("").to_ascii_lowercase();
    match scheme.as_str() {
        "postgres" | "postgresql" => Ok(Kind::Postgres),
        "mysql" | "mariadb" => Ok(Kind::MySql),
        "sqlite" => Ok(Kind::Sqlite),
        "" => Err("Enter a connection URL.".into()),
        other => Err(format!(
            "“{other}://” isn't supported here yet. Use postgresql://, mysql:// or sqlite:"
        )),
    }
}

/// Bytes that aren't UTF-8 (blobs) are shown as hex, like psql does.
fn hex(bytes: &[u8]) -> String {
    let mut s = String::with_capacity(2 + bytes.len() * 2);
    s.push_str("\\x");
    for b in bytes {
        s.push_str(&format!("{b:02x}"));
    }
    s
}

/// Runs `$sql` on `$conn` (any sqlx connection) and collects text values.
macro_rules! collect {
    ($conn:expr, $sql:expr, $max:expr) => {{
        let mut out = QueryResult {
            columns: vec![],
            rows: vec![],
            rows_affected: 0,
            truncated: false,
            elapsed_ms: 0,
        };
        // The user typed this SQL on purpose: it is run as-is (raw, multi-statement).
        let mut stream = $conn.fetch_many(sqlx::raw_sql(sqlx::AssertSqlSafe($sql.to_string())));
        while let Some(item) = stream.try_next().await.map_err(|e| e.to_string())? {
            match item {
                Either::Left(done) => out.rows_affected += done.rows_affected(),
                Either::Right(row) => {
                    let cols: Vec<String> =
                        row.columns().iter().map(|c| c.name().to_string()).collect();
                    // A new result set (another SELECT) replaces the previous one.
                    if cols != out.columns {
                        out.columns = cols;
                        out.rows.clear();
                        out.truncated = false;
                    }
                    if out.rows.len() >= $max {
                        out.truncated = true;
                        continue;
                    }
                    let values = (0..row.len())
                        .map(|i| match row.try_get_unchecked::<Option<String>, _>(i) {
                            Ok(v) => v,
                            Err(_) => row
                                .try_get_unchecked::<Option<Vec<u8>>, _>(i)
                                .ok()
                                .flatten()
                                .map(|b| hex(&b)),
                        })
                        .collect();
                    out.rows.push(values);
                }
            }
        }
        out
    }};
}

async fn run(
    url: &str,
    sql: &str,
    max_rows: usize,
    read_only: bool,
) -> Result<QueryResult, String> {
    let started = Instant::now();
    let kind = kind_of(url)?;
    let connect_err = |e: sqlx::Error| format!("Couldn't connect: {e}");
    let timeout = |_| "Connecting took too long (15 s). Check host, port and firewall.".to_string();

    let mut result = match kind {
        Kind::Postgres => {
            let mut conn = tokio::time::timeout(CONNECT_TIMEOUT, sqlx::PgConnection::connect(url))
                .await
                .map_err(timeout)?
                .map_err(connect_err)?;
            if read_only {
                conn.execute("SET SESSION CHARACTERISTICS AS TRANSACTION READ ONLY")
                    .await
                    .map_err(|e| e.to_string())?;
            }
            let r = collect!(&mut conn, sql, max_rows);
            let _ = conn.close().await;
            r
        }
        Kind::MySql => {
            let mut conn =
                tokio::time::timeout(CONNECT_TIMEOUT, sqlx::MySqlConnection::connect(url))
                    .await
                    .map_err(timeout)?
                    .map_err(connect_err)?;
            if read_only {
                conn.execute("SET SESSION TRANSACTION READ ONLY")
                    .await
                    .map_err(|e| e.to_string())?;
            }
            let r = collect!(&mut conn, sql, max_rows);
            let _ = conn.close().await;
            r
        }
        Kind::Sqlite => {
            let mut conn =
                tokio::time::timeout(CONNECT_TIMEOUT, sqlx::SqliteConnection::connect(url))
                    .await
                    .map_err(timeout)?
                    .map_err(connect_err)?;
            if read_only {
                conn.execute("PRAGMA query_only = ON")
                    .await
                    .map_err(|e| e.to_string())?;
            }
            let r = collect!(&mut conn, sql, max_rows);
            let _ = conn.close().await;
            r
        }
    };
    result.elapsed_ms = started.elapsed().as_millis() as u64;
    Ok(result)
}

/// Run SQL. `read_only` (default true in the UI) blocks INSERT/UPDATE/DELETE/DDL at the database.
#[tauri::command]
pub async fn db_query(
    url: String,
    sql: String,
    max_rows: Option<usize>,
    read_only: Option<bool>,
) -> Result<QueryResult, String> {
    let max = max_rows.unwrap_or(500).clamp(1, 10_000);
    tokio::time::timeout(
        QUERY_TIMEOUT,
        run(&url, &sql, max, read_only.unwrap_or(true)),
    )
    .await
    .map_err(|_| "The query took longer than 2 minutes and was stopped.".to_string())?
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn sqlite_round_trip() {
        let url = "sqlite::memory:";
        let sql = "CREATE TABLE t (id INTEGER PRIMARY KEY, name TEXT, score REAL, data BLOB);
                   INSERT INTO t (name, score, data) VALUES ('a', 1.5, x'00ff'), (NULL, 2, NULL);
                   SELECT id, name, score, data FROM t ORDER BY id;";
        let r = run(url, sql, 10, false).await.unwrap();
        assert_eq!(r.columns, vec!["id", "name", "score", "data"]);
        assert_eq!(r.rows_affected, 2);
        assert_eq!(
            r.rows[0],
            vec![
                Some("1".into()),
                Some("a".into()),
                Some("1.5".into()),
                Some("\\x00ff".into())
            ]
        );
        assert_eq!(r.rows[1][1], None);
    }

    #[tokio::test]
    async fn sqlite_read_only_and_limits() {
        let err = run("sqlite::memory:", "CREATE TABLE x (a INT)", 10, true)
            .await
            .unwrap_err();
        assert!(
            err.to_lowercase().contains("readonly")
                || err.to_lowercase().contains("read-only")
                || err.contains("query_only"),
            "{err}"
        );
        let r = run("sqlite::memory:", "WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x < 50) SELECT x FROM n", 10, true).await.unwrap();
        assert_eq!(r.rows.len(), 10);
        assert!(r.truncated);
    }

    #[tokio::test]
    async fn rejects_unknown_scheme() {
        assert!(
            run("mssql://x", "select 1", 1, true)
                .await
                .unwrap_err()
                .contains("isn't supported")
        );
    }

    /// Needs a local PostgreSQL: DEVKIT_PG_URL=postgresql://… cargo test -- --ignored
    #[tokio::test]
    #[ignore]
    async fn postgres_types_as_text() {
        let url = std::env::var("DEVKIT_PG_URL").expect("DEVKIT_PG_URL");
        let r = run(&url, "SELECT 1::int AS i, 2.50::numeric AS n, now()::date IS NOT NULL AS ok, '{\"a\":1}'::jsonb AS j, gen_random_uuid() IS NOT NULL AS u, NULL::text AS nothing, '\\x0aff'::bytea AS b", 10, true).await.unwrap();
        assert_eq!(r.rows[0][0].as_deref(), Some("1"));
        assert_eq!(r.rows[0][1].as_deref(), Some("2.50"));
        assert_eq!(r.rows[0][2].as_deref(), Some("t"));
        assert_eq!(r.rows[0][3].as_deref(), Some("{\"a\": 1}"));
        assert_eq!(r.rows[0][5], None);
        assert_eq!(r.rows[0][6].as_deref(), Some("\\x0aff"));
        let err = run(&url, "CREATE TABLE should_fail (a int)", 10, true)
            .await
            .unwrap_err();
        assert!(err.contains("read-only"), "{err}");
    }

    /// Needs a local MySQL/MariaDB: DEVKIT_MYSQL_URL=mysql://… cargo test -- --ignored
    #[tokio::test]
    #[ignore]
    async fn mysql_types_as_text() {
        let url = std::env::var("DEVKIT_MYSQL_URL").expect("DEVKIT_MYSQL_URL");
        let r = run(&url, "SELECT 1 AS i, CAST(2.5 AS DECIMAL(5,2)) AS n, NULL AS nothing, NOW() IS NOT NULL AS ok", 10, true).await.unwrap();
        assert_eq!(r.columns, vec!["i", "n", "nothing", "ok"]);
        assert_eq!(
            r.rows[0],
            vec![
                Some("1".into()),
                Some("2.50".into()),
                None,
                Some("1".into())
            ]
        );
        let err = run(&url, "CREATE TABLE should_fail (a int)", 10, true)
            .await
            .unwrap_err();
        assert!(
            err.to_lowercase().contains("read only") || err.contains("READ ONLY"),
            "{err}"
        );
        let w = run(&url, "CREATE TABLE IF NOT EXISTS t (a int); DELETE FROM t; INSERT INTO t VALUES (1),(2); SELECT COUNT(*) AS c FROM t; DROP TABLE t;", 10, false).await.unwrap();
        assert_eq!(w.rows[0][0].as_deref(), Some("2"));
        assert_eq!(w.rows_affected, 2);
    }
}
