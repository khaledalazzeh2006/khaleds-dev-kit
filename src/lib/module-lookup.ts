import type { DevKitModule } from "@/app/module";

/**
 * Lets a module look up other modules (My Library shows favorites from everywhere) without
 * importing the registry, which would be a circular import. The registry sets it at startup.
 */
let lookup: (id: string) => DevKitModule | undefined = () => undefined;

export const setModuleLookup = (fn: typeof lookup) => {
  lookup = fn;
};

export const findModule = (id: string) => lookup(id);
