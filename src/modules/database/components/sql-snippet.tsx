import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OutputCode } from "@/components/tool/output-code";
import { ToolLayout } from "@/components/tool/tool-layout";
import { openExternal } from "@/lib/open-url";
import type { DetailProps } from "@/app/module";
import { sqlSnippetById } from "../lib/data";

export default function SqlSnippet({ item }: DetailProps) {
  const s = sqlSnippetById.get(item.id);
  if (!s) return null;
  return (
    <ToolLayout
      layout="stacked"
      title={s.title}
      description={s.description}
      actions={
        <Button variant="ghost" size="sm" onClick={() => void openExternal(s.source)}>
          <ExternalLink /> Docs
        </Button>
      }
      input={null}
      output={<OutputCode label="SQL" code={s.code} language="sql" />}
    />
  );
}
