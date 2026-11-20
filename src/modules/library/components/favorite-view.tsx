import { Suspense } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { findModule } from "@/lib/module-lookup";
import { useLibrary } from "@/lib/store/library";

/** A starred item, shown in place with its own tool, plus a link back to where it lives. */
export default function FavoriteView({ favKey }: { favKey: string }) {
  const toggleFavorite = useLibrary((s) => s.toggleFavorite);
  const [moduleId, itemId] = favKey.split(":");
  const m = moduleId ? findModule(moduleId) : undefined;
  const item = m?.items().find((i) => i.id === itemId);
  if (!m || !item) return null;
  const { Detail, icon: Icon } = m;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        <span className="min-w-0 flex-1 truncate">
          Favorite from <span className="font-medium text-foreground">{m.title}</span>
        </span>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/$moduleId/$itemId" params={{ moduleId: m.id, itemId: item.id }}>
            <ExternalLink /> Open in {m.title}
          </Link>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => toggleFavorite(favKey)}>
          <Star className="fill-current text-warning" /> Unstar
        </Button>
      </div>
      <div className="min-h-0 flex-1">
        <Suspense fallback={<div className="p-4 text-muted-foreground">Loading…</div>}>
          <Detail item={item} />
        </Suspense>
      </div>
    </div>
  );
}
