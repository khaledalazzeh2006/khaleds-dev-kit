import { useEffect } from "react";
import { Outlet, useNavigate } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useHotkeys, isTypingTarget } from "@/lib/hotkeys";
import { useUi } from "@/lib/store/ui";
import { useTheme } from "@/lib/store/theme";
import { useActiveOutput } from "@/lib/store/output";
import { copyText } from "@/lib/clipboard";
import { CommandPalette } from "./command-palette";
import { AboutDialog } from "./about-dialog";
import { startLibraryBackups } from "@/lib/library-backup";
import { checkForUpdateInBackground } from "@/lib/updates";
import { modules } from "./registry";

/** Global pieces that live outside any page: hotkeys, palette, toasts, tooltips. */
export function RootLayout() {
  const navigate = useNavigate();
  const { setPaletteOpen, toggleSidebar } = useUi.getState();
  const theme = useTheme((s) => s.mode);

  // Desktop app only (both are no-ops in the browser).
  useEffect(() => startLibraryBackups(), []);
  useEffect(() => checkForUpdateInBackground(() => useUi.getState().setAboutOpen(true)), []);

  const goToModule = (n: number) => (e: KeyboardEvent) => {
    const m = modules[n - 1];
    if (!m) return;
    e.preventDefault();
    navigate({ to: "/$moduleId", params: { moduleId: m.id } });
  };

  useHotkeys({
    "mod+k": (e) => {
      e.preventDefault();
      setPaletteOpen(!useUi.getState().paletteOpen);
    },
    "mod+b": (e) => {
      e.preventDefault();
      toggleSidebar();
    },
    "mod+c": (e) => {
      // Copy the tool output when nothing is selected and the user isn't in a field.
      const output = useActiveOutput.getState().value;
      if (!output || isTypingTarget(e.target) || window.getSelection()?.toString()) return;
      e.preventDefault();
      void copyText(output);
    },
    ...Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => [`mod+${n}`, goToModule(n)])),
  });

  return (
    <TooltipProvider>
      <Outlet />
      <CommandPalette />
      <AboutDialog />
      <Toaster
        position="bottom-center"
        theme={theme}
        toastOptions={{
          className: "!bg-popover !text-popover-foreground !border-border !text-[13px] !py-2.5",
        }}
      />
    </TooltipProvider>
  );
}
