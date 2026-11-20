import { useMemo, useState } from "react";
import { Command } from "cmdk";
import { useNavigate } from "@tanstack/react-router";
import { History } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Kbd } from "@/components/kbd";
import { copyText } from "@/lib/clipboard";
import { useUi } from "@/lib/store/ui";
import type { SearchEntry } from "@/lib/search/search-index";
import { getModule, modules } from "./registry";
import { resolveCopyValue } from "./module";
import { getSearch } from "./search";
import { useLibrary } from "@/lib/store/library";

const MAX_PER_GROUP = 8;

/** Mod K: search everything. Results grouped by module, recent items first when empty. */
export function CommandPalette() {
  const navigate = useNavigate();
  const { paletteOpen, setPaletteOpen, recent, pushRecent, setNarrowView } = useUi();
  const [query, setQuery] = useState("");
  const libraryRev = useLibrary((s) => s.rev);

  const groups = useMemo(() => {
    const { entries, index } = getSearch();
    const byKey = new Map(entries.map((e) => [e.key, e]));
    if (!query.trim()) {
      const recentEntries = recent
        .map((k) => byKey.get(k))
        .filter((e): e is SearchEntry => !!e)
        .slice(0, MAX_PER_GROUP);
      return recentEntries.length
        ? [{ id: "recent", title: "Recent", entries: recentEntries }]
        : [];
    }
    const hits = index.search(query);
    return modules
      .map((m) => ({
        id: m.id,
        title: m.title,
        entries: hits.filter((h) => h.moduleId === m.id).slice(0, MAX_PER_GROUP),
      }))
      .filter((g) => g.entries.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- libraryRev: re-search after library edits
  }, [query, recent, libraryRev]);

  const close = () => {
    setPaletteOpen(false);
    setQuery("");
  };

  const select = (e: SearchEntry) => {
    pushRecent(e.key);
    const value = resolveCopyValue(e);
    if (value) void copyText(value);
    navigate({ to: "/$moduleId/$itemId", params: { moduleId: e.moduleId, itemId: e.itemId } });
    setNarrowView("detail");
    close();
  };

  return (
    <Dialog open={paletteOpen} onOpenChange={(open) => (open ? setPaletteOpen(true) : close())}>
      <DialogContent aria-describedby="palette-desc">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <DialogDescription id="palette-desc" className="sr-only">
          Search tools, commands and snippets
        </DialogDescription>
        <Command shouldFilter={false} loop className="flex flex-col">
          <Command.Input
            value={query}
            onValueChange={setQuery}
            placeholder="Search tools, commands, snippets…"
            className="h-12 border-b bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground"
          />
          <Command.List className="max-h-[min(60vh,420px)] overflow-y-auto p-1.5">
            <Command.Empty className="p-6 text-center text-muted-foreground">
              {query.trim() ? `No results for “${query}”.` : "Type to search everything."}
            </Command.Empty>
            {groups.map((g) => (
              <Command.Group
                key={g.id}
                heading={g.title}
                className="[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
              >
                {g.entries.map((e) => {
                  const Icon =
                    g.id === "recent" ? History : (getModule(e.moduleId)?.icon ?? History);
                  return (
                    <Command.Item
                      key={e.key}
                      value={e.key}
                      onSelect={() => select(e)}
                      className="flex cursor-default items-center gap-3 rounded-md px-2.5 py-2 data-[selected=true]:bg-accent"
                    >
                      <Icon className="size-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm">{e.title}</span>
                        {e.description && (
                          <span className="block truncate text-xs text-muted-foreground">
                            {e.description}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {e.copyValue ? "Copy" : "Open"} <Kbd keys={["↵"]} className="ml-1" />
                      </span>
                    </Command.Item>
                  );
                })}
              </Command.Group>
            ))}
          </Command.List>
          <div className="flex items-center justify-end gap-3 border-t px-3 py-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Kbd keys={["↑", "↓"]} /> move
            </span>
            <span className="flex items-center gap-1">
              <Kbd keys={["↵"]} /> select
            </span>
            <span className="flex items-center gap-1">
              <Kbd keys={["Esc"]} /> close
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
