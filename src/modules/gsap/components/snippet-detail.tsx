import { useState } from "react";
import { ExternalLink, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OutputCode } from "@/components/tool/output-code";
import { Segmented } from "@/components/tool/segmented";
import { ToolLayout } from "@/components/tool/tool-layout";
import { usePersistentState } from "@/lib/hooks/use-persistent-state";
import { openExternal } from "@/lib/open-url";
import type { DetailProps } from "@/app/module";
import { snippetById } from "../lib/data";
import { defaultParams, fillParams, installCommand, type ParamValues } from "../lib/render";
import { ParamField } from "./param-field";
import { interactive, previews } from "./previews";

export default function SnippetDetail({ item }: DetailProps) {
  const snippet = snippetById.get(item.id)!;
  const defaults = defaultParams(snippet);
  const [values, setValues] = usePersistentState<ParamValues>(`gsap:${snippet.id}`, defaults);
  const [flavor, setFlavor] = usePersistentState<"vanilla" | "react">("gsap:flavor", "react");
  const [replay, setReplay] = useState(0);
  const params = { ...defaults, ...values };
  const Preview = snippet.preview ? previews[snippet.preview] : undefined;
  const code = fillParams(
    flavor === "react" && snippet.codeReact ? snippet.codeReact : snippet.code,
    snippet,
    params,
  );
  const install = installCommand(snippet);

  return (
    <ToolLayout
      title={snippet.title}
      description={snippet.description}
      actions={
        <>
          {snippet.params?.length ? (
            <Button variant="ghost" size="sm" onClick={() => setValues(defaults)}>
              <RotateCcw /> Reset
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" onClick={() => void openExternal(snippet.source)}>
            <ExternalLink /> Docs
          </Button>
        </>
      }
      input={
        <>
          {Preview && (
            <div className="flex flex-col gap-2">
              <Preview p={params} replay={replay} />
              {!interactive.has(snippet.preview!) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={() => setReplay((r) => r + 1)}
                >
                  <Play /> Replay
                </Button>
              )}
            </div>
          )}
          {snippet.params?.map((p) => (
            <ParamField
              key={p.key}
              param={p}
              value={params[p.key]!}
              onChange={(v) => setValues({ ...params, [p.key]: v })}
            />
          ))}
        </>
      }
      output={
        <>
          {snippet.codeReact && (
            <Segmented
              label="Code flavor"
              value={flavor}
              onChange={setFlavor}
              options={[
                { value: "react", label: "React (useGSAP)" },
                { value: "vanilla", label: "Vanilla JS" },
              ]}
            />
          )}
          <OutputCode
            label={flavor === "react" && snippet.codeReact ? "React" : "JavaScript"}
            code={code}
            language={flavor === "react" ? "jsx" : "javascript"}
          />
          {install && <OutputCode label="Install" code={install} />}
        </>
      }
    />
  );
}
