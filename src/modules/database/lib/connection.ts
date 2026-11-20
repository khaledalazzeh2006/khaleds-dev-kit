export type Engine = "postgresql" | "mysql" | "sqlserver" | "mongodb" | "sqlite";

export interface ConnectionOptions {
  engine: Engine;
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl: boolean;
  file: string; // sqlite
}

export const defaultPorts: Record<Engine, number> = {
  postgresql: 5432,
  mysql: 3306,
  sqlserver: 1433,
  mongodb: 27017,
  sqlite: 0,
};

const enc = encodeURIComponent;

/** URL form (what Prisma, most ORMs and drivers accept). Credentials are percent-encoded. */
export function connectionUrl(o: ConnectionOptions): string {
  const auth = o.user ? `${enc(o.user)}${o.password ? `:${enc(o.password)}` : ""}@` : "";
  switch (o.engine) {
    case "postgresql":
      return `postgresql://${auth}${o.host}:${o.port}/${enc(o.database)}${o.ssl ? "?sslmode=require" : ""}`;
    case "mysql":
      return `mysql://${auth}${o.host}:${o.port}/${enc(o.database)}${o.ssl ? "?sslaccept=strict" : ""}`;
    case "mongodb":
      return `mongodb://${auth}${o.host}:${o.port}/${enc(o.database)}${o.user ? "?authSource=admin" : ""}${o.ssl ? `${o.user ? "&" : "?"}tls=true` : ""}`;
    case "sqlserver":
      return `sqlserver://${o.host}:${o.port};database=${o.database};user=${o.user};password=${o.password};encrypt=${o.ssl ? "true" : "false"};trustServerCertificate=${o.ssl ? "false" : "true"}`;
    case "sqlite":
      return `file:${o.file || "./dev.db"}`;
  }
}

/** ADO.NET connection string (EF Core / SqlClient). Only for SQL Server. */
export function adoNetString(o: ConnectionOptions): string {
  return `Server=${o.host},${o.port};Database=${o.database};User Id=${o.user};Password=${o.password};Encrypt=${o.ssl ? "True" : "False"};TrustServerCertificate=${o.ssl ? "False" : "True"};`;
}
