import { createSearchIndex, type SearchEntry } from "./search-index";

const entry = (itemId: string, title: string, keywords?: string[]): SearchEntry => ({
  key: `m:${itemId}`,
  moduleId: "m",
  itemId,
  title,
  keywords,
});

describe("createSearchIndex", () => {
  const index = createSearchIndex([
    entry("px-rem", "PX to REM", ["units", "font size"]),
    entry("git-commit", "Commit staged changes", ["git"]),
  ]);

  it("finds by title prefix", () => {
    expect(index.search("comm").map((e) => e.itemId)).toEqual(["git-commit"]);
  });

  it("finds by keyword", () => {
    expect(index.search("units").map((e) => e.itemId)).toEqual(["px-rem"]);
  });

  it("returns nothing for an empty query", () => {
    expect(index.search("  ")).toEqual([]);
  });
});
