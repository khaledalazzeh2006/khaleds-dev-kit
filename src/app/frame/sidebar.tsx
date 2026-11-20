import { Link } from "@tanstack/react-router";
import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Kbd } from "@/components/kbd";
import { useUi } from "@/lib/store/ui";
import { cn } from "@/lib/utils";
import { modules } from "../registry";

/** Module navigation. Icons only below 1100px or when collapsed with Mod B. */
export function Sidebar({ activeId }: { activeId: string }) {
  const { sidebarCollapsed, toggleSidebar, setNarrowView } = useUi();
  const wide = !sidebarCollapsed;

  return (
    <nav
      aria-label="Modules"
      className={cn(
        "flex w-13 shrink-0 flex-col gap-0.5 border-r p-2",
        wide && "@min-[1100px]:w-52",
      )}
    >
      {modules.map((m, i) => {
        const Icon = m.icon;
        const active = m.id === activeId;
        return (
          <Tooltip key={m.id}>
            <TooltipTrigger asChild>
              <Link
                to="/$moduleId"
                params={{ moduleId: m.id }}
                onClick={() => setNarrowView("list")}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-8 items-center gap-2.5 rounded-md px-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                  active && "bg-accent font-medium text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className={cn("hidden truncate", wide && "@min-[1100px]:inline")}>
                  {m.title}
                </span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className={cn(wide && "@min-[1100px]:hidden")}>
              {m.title} {i < 9 && <Kbd keys={["mod", String(i + 1)]} />}
            </TooltipContent>
          </Tooltip>
        );
      })}
      <div className="mt-auto">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <PanelLeft />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            Toggle sidebar <Kbd keys={["mod", "B"]} />
          </TooltipContent>
        </Tooltip>
      </div>
    </nav>
  );
}
