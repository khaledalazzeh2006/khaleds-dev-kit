import { allColumns, relations, type Schema } from "./schema";

export const BOX_W = 210;
export const HEAD_H = 28;
export const ROW_H = 20;
const GAP_X = 70;
const GAP_Y = 40;

export interface BoxLayout {
  name: string;
  x: number;
  y: number;
  h: number;
  rows: { name: string; type: string; pk: boolean; fk: boolean; nullable: boolean }[];
}

/** Simple grid layout for the ER diagram, plus link paths between FK rows and their targets. */
export function layoutDiagram(schema: Schema) {
  const n = schema.tables.length;
  const cols = Math.max(1, Math.ceil(Math.sqrt(n)));
  const boxes: BoxLayout[] = [];
  let y = 0;
  for (let r = 0; r < Math.ceil(n / cols); r++) {
    const rowTables = schema.tables.slice(r * cols, r * cols + cols);
    let rowH = 0;
    rowTables.forEach((t, c) => {
      const rows = allColumns(t).map((col) => ({
        name: col.name,
        type: col.type === "id" ? "int" : col.type,
        pk: col.primary,
        fk: !!col.references,
        nullable: col.nullable,
      }));
      const h = HEAD_H + rows.length * ROW_H + 6;
      rowH = Math.max(rowH, h);
      boxes.push({ name: t.name, x: c * (BOX_W + GAP_X), y, h, rows });
    });
    y += rowH + GAP_Y;
  }
  const rowY = (b: BoxLayout, col: string) =>
    b.y +
    HEAD_H +
    Math.max(
      0,
      b.rows.findIndex((r) => r.name === col),
    ) *
      ROW_H +
    ROW_H / 2;
  const links = relations(schema).flatMap((rel) => {
    const from = boxes.find((b) => b.name === rel.from.name);
    const to = boxes.find((b) => b.name === rel.column.references!.table);
    if (!from || !to) return [];
    const y1 = rowY(from, rel.column.name);
    const y2 = rowY(to, rel.column.references!.column);
    // Same column (or self-reference): leave and enter on the right side with a loop.
    const sameCol = from.x === to.x;
    const fromRight = from.x < to.x;
    const x1 = sameCol || fromRight ? from.x + BOX_W : from.x;
    const x2 = sameCol ? to.x + BOX_W : fromRight ? to.x : to.x + BOX_W;
    const dx = sameCol ? 40 : Math.max(30, Math.abs(x2 - x1) / 2);
    const c1 = sameCol || fromRight ? x1 + dx : x1 - dx;
    const c2 = sameCol ? x2 + dx : fromRight ? x2 - dx : x2 + dx;
    return [
      {
        id: `${rel.from.name}.${rel.column.name}`,
        d: `M${x1},${y1} C${c1},${y1} ${c2},${y2} ${x2},${y2}`,
        nullable: rel.column.nullable,
      },
    ];
  });
  const width = Math.max(...boxes.map((b) => b.x + BOX_W), BOX_W) + 60; // room for right-side loops
  const height = Math.max(...boxes.map((b) => b.y + b.h), 100) + 10;
  return { boxes, links, width, height };
}
