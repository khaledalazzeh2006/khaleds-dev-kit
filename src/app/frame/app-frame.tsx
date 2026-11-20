import { useParams } from "@tanstack/react-router";
import { useUi } from "@/lib/store/ui";
import { cn } from "@/lib/utils";
import { getModule } from "../registry";
import { TitleBar } from "./title-bar";
import { Sidebar } from "./sidebar";
import { ListPane } from "./list-pane";
import { DetailPane } from "./detail-pane";

/**
 * Three panes: Sidebar → List → Detail. Responds to the WINDOW width via container queries:
 * ≥1100px all three · 760–1099px icon sidebar · <760px list OR detail (with a back button).
 */
export function AppFrame() {
  const { moduleId, itemId } = useParams({ from: "/$moduleId/$itemId" });
  const narrowView = useUi((s) => s.narrowView);
  const module = getModule(moduleId);
  const item = module?.items().find((i) => i.id === itemId);
  if (!module || !item) return null;

  return (
    <div className="@container flex h-full flex-col">
      <TitleBar />
      <div className="flex min-h-0 flex-1">
        <Sidebar activeId={module.id} />
        <ListPane
          key={module.id} // fresh filter per module
          module={module}
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
