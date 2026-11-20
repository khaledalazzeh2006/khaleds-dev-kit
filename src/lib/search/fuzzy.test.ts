import { fuzzyMatch } from "./fuzzy";

describe("fuzzyMatch", () => {
  it("matches subsequences case-insensitively", () => {
    expect(fuzzyMatch("pxr", "PX to REM")?.indices).toEqual([0, 1, 6]);
  });

  it("returns null when characters are missing", () => {
    expect(fuzzyMatch("xyz", "PX to REM")).toBeNull();
  });

  it("scores contiguous matches above scattered ones", () => {
    const tight = fuzzyMatch("rem", "PX to REM")!.score;
    const loose = fuzzyMatch("rem", "React element map")!.score;
    expect(tight).toBeGreaterThan(loose);
  });

  it("matches everything for an empty query", () => {
    expect(fuzzyMatch("  ", "anything")).toEqual({ score: 0, indices: [] });
  });
});
