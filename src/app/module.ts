import type { ComponentType, LazyExoticComponent } from "react";
import type { LucideIcon } from "lucide-react";

/** One row in a module's list pane (a tool, a command, a snippet...). */
export interface ModuleItem {
  id: string; // kebab-case, unique within the module
  title: string;
  description?: string;
  tags?: string[];
  /** Extra search words that don't appear in the title. */
  keywords?: string[];
  /** List section header. Items with a group must already be sorted by group. */
  group?: string;
  /**
   * If set, Enter copies this value (commands, snippets). Otherwise Enter opens the item.
   * Use a function when the value depends on user input (e.g. filled-in variables).
   */
  copyValue?: string | (() => string);
}

/** The text to copy for an item, or undefined if Enter should just open it. */
export function resolveCopyValue(item: Pick<ModuleItem, "copyValue">): string | undefined {
  return typeof item.copyValue === "function" ? item.copyValue() : item.copyValue;
}

export interface DetailProps {
  item: ModuleItem;
}

/** The only thing the app shell knows about a module. See .claude/skills/new-module. */
export interface DevKitModule {
  id: string; // kebab-case, used in the URL: /#/<id>/<itemId>
  title: string;
  description: string;
  icon: LucideIcon;
  /** Sidebar position (and Mod 1..9 order). */
  order: number;
  /** Items for the list pane. Must return at least one item. */
  items: () => ModuleItem[];
  /** Renders the selected item in the detail pane. Use React.lazy to keep startup fast. */
  Detail: ComponentType<DetailProps> | LazyExoticComponent<ComponentType<DetailProps>>;
}
