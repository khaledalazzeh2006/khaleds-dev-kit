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
  /** If set, Enter copies this value (commands, snippets). Otherwise Enter opens the item. */
  copyValue?: string;
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
