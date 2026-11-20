import type { DetailProps } from "@/app/module";
import { FAVORITE_PREFIX, SNIPPET_PREFIX, favoriteKey } from "../lib/items";
import FavoriteView from "./favorite-view";
import Manage from "./manage";
import SnippetEditor from "./snippet-editor";

export default function LibraryDetail({ item }: DetailProps) {
  if (item.id.startsWith(SNIPPET_PREFIX))
    return <SnippetEditor key={item.id} id={item.id.slice(SNIPPET_PREFIX.length)} />;
  if (item.id.startsWith(FAVORITE_PREFIX)) return <FavoriteView favKey={favoriteKey(item.id)} />;
  return <Manage />;
}
