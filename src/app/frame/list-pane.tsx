import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/kbd";
import { Highlight } from "@/components/highlight";
import { fuzzyMatch } from "@/lib/search/fuzzy";
import { isTypingTarget, matchesHotkey } from "@/lib/hotkeys";
import { copyText } from "@/lib/clipboard";
import { useUi } from "@/lib/store/ui";
import { useLibrary } from "@/lib/store/library";
import { modLabel } from "@/lib/platform";
import { canFavorite } from "../favorites";
import { cn } from "@/lib/utils";
import { resolveCopyValue, type DevKitModule, type ModuleItem } from "../module";

interface ListPaneProps {
  module: DevKitModule;
  /** The module's current items (from useModuleItems, so runtime changes show up). */
  items: ModuleItem[];
  activeItemId: string;
  className?: string;
}

/** The module's items with a fuzzy filter. "/" focuses the filter, ↑↓ move, Enter copies/opens. */
export function ListPane({ module, items, activeItemId, className }: ListPaneProps) {
  const navigate = useNavigate();
  const { setNarrowView, setPaletteOpen, pushRecent } = useUi.getState();
  const [query, setQuery] = useState("");
  const favorites = useLibrary((s) => s.favorites);
  const toggleFavorite = useLibrary((s) => s.toggleFavorite);
  const starrable = canFavorite(module.id);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Keep the selected row visible when moving with ↑↓ in a long list.
  // Braces matter: newer Chromium returns a Promise from scrollIntoView, and an effect must
  // return nothing or a cleanup function (otherwise React throws "destroy is not a function").
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeItemId]);

  const results = useMemo(() => {
    if (!query.trim()) return items.map((item) => ({ item, indices: [] as number[] }));
    return items
      .map((item) => {
        const title = fuzzyMatch(query, item.title);
        if (title) return { item, score: title.score, indices: title.indices };
        // Fall back to group + keywords (e.g. "prisma" or a word from the command), ranked lower.
        const extra = fuzzyMatch(query, [item.group, ...(item.keywords ?? [])].join(" "));
        return extra ? { item, score: extra.score - 10, indices: [] as number[] } : null;
      })
      .filter((r) => r !== null)
      .sort((a, b) => b.score - a.score)
      .map(({ item, indices }) => ({ item, indices }));
  }, [items, query]);

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
    const value = resolveCopyValue(item);
    if (value) void copyText(value);
    open(item);
    if (!value) setNarrowView("detail");
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
          {results.map(({ item, indices }, i) => {
            const active = item.id === activeItemId;
            const favKey = `${module.id}:${item.id}`;
            const starred = starrable && favorites.includes(favKey);
            const showGroup =
              !query.trim() && item.group && item.group !== results[i - 1]?.item.group;
            return (
              <Fragment key={item.id}>
                {showGroup && (
                  <li
                    role="presentation"
                    className="px-2.5 pt-3 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase"
                  >
                    {item.group}
                  </li>
                )}
                <li role="option" aria-selected={active} className="group/row relative">
                  <button
                    ref={active ? activeRef : undefined}
                    onClick={() => activate(item)}
                    className={cn(
                      "flex w-full flex-col gap-0.5 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-accent",
                      starrable && "pr-9",
                      active && "bg-accent",
                    )}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">
                        <Highlight text={item.title} indices={indices} />
                      </span>
                      {item.tags?.[0] && (
                        <span
                          className={cn(
                            "shrink-0 rounded-full bg-muted px-1.5 text-[11px] text-muted-foreground",
                            item.tags[0] === "danger" && "bg-destructive/15 text-destructive",
                          )}
                        >
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
                  {starrable && (
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => toggleFavorite(favKey)}
                      aria-label={
                        starred
                          ? `Remove ${item.title} from favorites`
                          : `Add ${item.title} to favorites`
                      }
                      aria-pressed={starred}
                      title={`${starred ? "Remove from" : "Add to"} favorites (${modLabel}+D)`}
                      className={cn(
                        "absolute top-1/2 right-1.5 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground opacity-0 transition hover:bg-background hover:text-foreground group-hover/row:opacity-100 focus-visible:opacity-100",
                        (starred || active) && "opacity-100",
                        starred && "text-warning hover:text-warning",
                      )}
                    >
                      <Star className={cn("size-3.5", starred && "fill-current")} />
                    </button>
                  )}
                </li>
              </Fragment>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
