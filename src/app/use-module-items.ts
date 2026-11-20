import { useMemo, useSyncExternalStore } from "react";
import type { DevKitModule, ModuleItem } from "./module";

const noSubscribe = () => () => {};
const zero = () => 0;

/** A module's items, re-read when a module with `watch` reports a change. */
export function useModuleItems(module: DevKitModule | undefined): ModuleItem[] {
  const version = useSyncExternalStore(
    module?.watch?.subscribe ?? noSubscribe,
    module?.watch?.version ?? zero,
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps -- version is the change signal
  return useMemo(() => module?.items() ?? [], [module, version]);
}
