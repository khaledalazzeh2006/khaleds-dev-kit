import { ToolLayout } from "@/components/tool/tool-layout";

const UNITS: { unit: string; meaning: string; use: string }[] = [
  {
    unit: "vw / vh",
    meaning: "1% of the viewport width / height",
    use: "Wide layouts. Avoid 100vh on mobile (it ignores the browser bars).",
  },
  {
    unit: "svh",
    meaning: "Small viewport height: browser bars shown",
    use: "Content that must always fit on screen.",
  },
  {
    unit: "lvh",
    meaning: "Large viewport height: browser bars hidden",
    use: "Backgrounds that may extend under the bars.",
  },
  {
    unit: "dvh",
    meaning: "Dynamic: follows the bars as they show/hide",
    use: "Full-height hero sections on mobile: min-height: 100dvh.",
  },
  {
    unit: "vmin / vmax",
    meaning: "1% of the smaller / larger side",
    use: "Shapes that should fit both orientations.",
  },
  {
    unit: "cqw / cqh",
    meaning: "1% of the container's width / height",
    use: "Type and spacing inside @container components.",
  },
  {
    unit: "rem",
    meaning: "Root font size (usually 16px)",
    use: "Font sizes and spacing — respects the user's settings.",
  },
  {
    unit: "em",
    meaning: "Current element's font size",
    use: "Padding on buttons that scales with their text.",
  },
  {
    unit: "ch",
    meaning: "Width of the “0” character",
    use: "Readable line length: max-width: 65ch.",
  },
  {
    unit: "%",
    meaning: "Relative to the parent (property-dependent)",
    use: "Fluid widths inside a container.",
  },
];

export default function UnitsTool() {
  return (
    <ToolLayout
      layout="stacked"
      title="CSS units cheat sheet"
      description="Which unit to reach for, especially the newer viewport units for mobile."
      input={null}
      output={
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-left text-xs">
            <thead className="border-b bg-muted/40 text-muted-foreground">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">
                  Unit
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Means
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Use it for
                </th>
              </tr>
            </thead>
            <tbody>
              {UNITS.map((u) => (
                <tr key={u.unit} className="border-b last:border-0">
                  <td className="px-3 py-2 font-mono font-medium whitespace-nowrap text-primary">
                    {u.unit}
                  </td>
                  <td className="px-3 py-2">{u.meaning}</td>
                  <td className="px-3 py-2 text-muted-foreground">{u.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
    />
  );
}
