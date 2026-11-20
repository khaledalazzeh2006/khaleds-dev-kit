import { Navigate, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { useUi } from "@/lib/store/ui";
import { useLibrary } from "@/lib/store/library";
import { isTypingTarget, useHotkeys } from "@/lib/hotkeys";
import { cn } from "@/lib/utils";
import { getModule } from "../registry";
import { TitleBar } from "./title-bar";
import { Sidebar } from "./sidebar";
import { ListPane } from "./list-pane";
import { DetailPane } from "./detail-pane";
import { useModuleItems } from "../use-module-items";
import { canFavorite } from "../favorites";

/**
 * Three panes: Sidebar → List → Detail. Responds to the WINDOW width via container queries:
 * ≥1100px all three · 760–1099px icon sidebar · <760px list OR detail (with a back button).
 */
export function AppFrame() {
  const { moduleId, itemId } = useParams({ from: "/$moduleId/$itemId" });
  const narrowView = useUi((s) => s.narrowView);
  const module = getModule(moduleId);
  const items = useModuleItems(module);
  const item = items.find((i) => i.id === itemId);

  useHotkeys({
    "mod+d": (e) => {
      if (!module || !item || !canFavorite(module.id) || isTypingTarget(e.target)) return;
      e.preventDefault();
      const on = useLibrary.getState().toggleFavorite(`${module.id}:${item.id}`);
      toast(on ? `★ Added “${item.title}” to favorites` : `Removed “${item.title}” from favorites`);
    },
  });

  if (!module) return null;
  // The item can disappear while open (a library snippet was deleted): go to the module.
  if (!item) return <Navigate to="/$moduleId" params={{ moduleId: module.id }} />;

  return (
    <div className="@container flex h-full flex-col">
      <TitleBar />
      <div className="flex min-h-0 flex-1">
        <Sidebar activeId={module.id} />
        <ListPane
          key={module.id} // fresh filter per module
          module={module}
          items={items}
          activeItemId={item.id}
          className={cn(narrowView === "list" ? "flex" : "hidden", "@min-[760px]:flex")}
        />
        <DetailPane
          module={module}
          item={item}
          className={cn(narrowView === "detail" ? "flex" : "hidden", "@min-[760px]:flex")}
        />
      </div>
    </div>
  );
}
