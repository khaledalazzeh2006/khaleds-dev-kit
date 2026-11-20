import { Info, Monitor, Moon, Search, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Kbd } from "@/components/kbd";
import { useTheme } from "@/lib/store/theme";
import { useUi } from "@/lib/store/ui";

const themeIcon = { dark: Moon, light: Sun, system: Monitor } as const;
const themeLabel = { dark: "Dark", light: "Light", system: "System" } as const;

export function TitleBar() {
  const { mode, cycle } = useTheme();
  const setPaletteOpen = useUi((s) => s.setPaletteOpen);
  const setAboutOpen = useUi((s) => s.setAboutOpen);
  const ThemeIcon = themeIcon[mode];

  return (
    <header className="flex h-11 shrink-0 items-center justify-between gap-3 border-b px-3">
      <span className="flex items-center gap-2 text-sm font-semibold tracking-tight">
        <img src="/favicon.svg" alt="" className="size-5" />
        <span>
          Khaled&apos;s <span className="text-primary">Dev Kit</span>
        </span>
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="w-44 justify-between text-muted-foreground @max-[480px]:w-auto"
          onClick={() => setPaletteOpen(true)}
        >
          <span className="flex items-center gap-1.5">
            <Search /> <span className="@max-[480px]:hidden">Search…</span>
          </span>
          <Kbd keys={["mod", "K"]} className="@max-[480px]:hidden" />
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={cycle} aria-label="Change theme">
              <ThemeIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Theme: {themeLabel[mode]}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setAboutOpen(true)}
              aria-label="About and updates"
            >
              <Info />
            </Button>
          </TooltipTrigger>
          <TooltipContent>About & updates</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
