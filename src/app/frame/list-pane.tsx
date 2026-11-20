import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/kbd";
import { Highlight } from "@/components/highlight";
import { fuzzyMatch } from "@/lib/search/fuzzy";
import { isTypingTarget, matchesHotkey } from "@/lib/hotkeys";
import { copyText } from "@/lib/clipboard";
import { useUi } from "@/lib/store/ui";
import { cn } from "@/lib/utils";
import type { DevKitModule, ModuleItem } from "../module";

interface ListPaneProps {
  module: DevKitModule;
  activeItemId: string;
  className?: string;
}

/** The module's items with a fuzzy filter. "/" focuses the filter, ↑↓ move, Enter copies/opens. */
export function ListPane({ module, activeItemId, className }: ListPaneProps) {
  const navigate = useNavigate();
  const { setNarrowView, setPaletteOpen, pushRecent } = useUi.getState();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const items = module.items();
    if (!query.trim()) return items.map((item) => ({ item, indices: [] as number[] }));
    return items
      .map((item) => ({ item, match: fuzzyMatch(query, item.title) }))
      .filter((r) => r.match)
      .sort((a, b) => b.match!.score - a.match!.score)
      .map((r) => ({ item: r.item, indices: r.match!.indices }));
  }, [module, query]);

  // "/" focuses the filter from anywhere (unless already typing).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (matchesHotkey(e, "/") && !isTypingTarget(e.target)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const open = (item: ModuleItem) => {
    pushRecent(`${module.id}:${item.id}`);
    navigate({ to: "/$moduleId/$itemId", params: { moduleId: module.id, itemId: item.id } });
  };

  const activate = (item: ModuleItem) => {
    if (item.copyValue) void copyText(item.copyValue);
    open(item);
    if (!item.copyValue) setNarrowView("detail");
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const index = results.findIndex((r) => r.item.id === activeItemId);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next =
        results[
          Math.max(0, Math.min(results.length - 1, index + (e.key === "ArrowDown" ? 1 : -1)))
        ];
      if (next) open(next.item);
    } else if (e.key === "Enter") {
      const current = results[index] ?? results[0];
      if (current) activate(current.item);
    } else if (e.key === "Escape" && query) {
      e.stopPropagation();
      setQuery("");
    }
  };

  return (
    <aside
      aria-label={`${module.title} items`}
      onKeyDown={onKeyDown}
      className={cn(
        "min-w-0 flex-1 flex-col border-r @min-[760px]:w-72 @min-[760px]:flex-none",
        className,
      )}
    >
      <div className="flex flex-col gap-2 border-b p-3">
        <h1 className="text-base font-semibold">{module.title}</h1>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Filter ${module.title.toLowerCase()}`}
            aria-label={`Filter ${module.title}`}
            className="pr-8 pl-8"
          />
          <Kbd keys={["/"]} className="absolute top-1/2 right-2 -translate-y-1/2" />
        </div>
      </div>

      {results.length === 0 ? (
        <div className="flex flex-col items-start gap-2 p-4 text-muted-foreground">
          <p>
            No results for “{query}” in {module.title}.
          </p>
          <Button variant="outline" size="sm" onClick={() => setPaletteOpen(true)}>
            Search everywhere <Kbd keys={["mod", "K"]} />
          </Button>
        </div>
      ) : (
        <ul role="listbox" aria-label={module.title} className="flex-1 overflow-y-auto p-1.5">
          {results.map(({ item, indices }) => {
            const active = item.id === activeItemId;
            return (
              <li key={item.id} role="option" aria-selected={active}>
                <button
                  onClick={() => activate(item)}
                  className={cn(
                    "flex w-full flex-col gap-0.5 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-accent",
                    active && "bg-accent",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">
                      <Highlight text={item.title} indices={indices} />
                    </span>
                    {item.tags?.[0] && (
                      <span className="shrink-0 rounded-full bg-muted px-1.5 text-[11px] text-muted-foreground">
                        {item.tags[0]}
                      </span>
                    )}
                  </span>
                  {item.description && (
                    <span className="truncate text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
