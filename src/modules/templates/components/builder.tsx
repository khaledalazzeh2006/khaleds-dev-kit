import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Download, FolderPlus, Plus, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColorField } from "@/components/tool/color-field";
import { Field } from "@/components/tool/field";
import { OutputCode } from "@/components/tool/output-code";
import { Segmented } from "@/components/tool/segmented";
import { SelectField } from "@/components/tool/select-field";
import type { CodeLanguage } from "@/components/tool/code-input";
import { usePersistentState } from "@/lib/hooks/use-persistent-state";
import { useAsyncResult } from "@/lib/hooks/use-async-result";
import { saveBlob } from "@/lib/save-file";
import { isDesktop, joinPath, openInVsCode, pickFolder, writeProject } from "@/lib/native";
import { htmlProject, nextProject, pageHtml, slug, viteProject, type Target } from "../lib/export";
import type { Preset } from "../lib/model";
import { CATEGORY_ORDER, sectionById, sections } from "../lib/sections";
import { compileTailwind } from "../lib/tailwind";
import {
  BODY_CLASS,
  defaultTheme,
  entryCss,
  fonts,
  type Font,
  type Mode,
  type Radius,
  type SiteTheme,
} from "../lib/theme";
import { SiteFrame } from "./site-frame";

const DEVICES = { desktop: 1280, tablet: 820, phone: 390 } as const;
type Device = keyof typeof DEVICES;

const MAIN_FILE: Record<Target, string> = {
  html: "index.html",
  vite: "src/App.tsx",
  next: "app/page.tsx",
};

const languageOf = (path: string): CodeLanguage => {
  const ext = path.split(".").pop();
  if (ext === "tsx") return "jsx";
  if (ext === "ts" || ext === "mjs") return "typescript";
  if (ext === "html") return "html";
  if (ext === "css") return "css";
  if (ext === "json") return "json";
  return "text";
};

export default function Builder({ preset }: { preset: Preset }) {
  const [ids, setIds] = usePersistentState<string[]>(`tpl:${preset.id}:sections`, preset.sections);
  const [theme, setTheme] = usePersistentState<SiteTheme>("tpl:theme", defaultTheme);
  const [target, setTarget] = usePersistentState<Target>("tpl:target", "vite");
  const [view, setView] = usePersistentState<"preview" | "code">("tpl:view", "preview");
  const [device, setDevice] = usePersistentState<Device>("tpl:device", "desktop");
  const [file, setFile] = useState(MAIN_FILE[target]);

  const valid = ids.filter((id) => sectionById.has(id));
  const set = <K extends keyof SiteTheme>(k: K, v: SiteTheme[K]) => setTheme({ ...theme, [k]: v });
  const title = `${theme.name} · ${preset.title}`;
  const html = useMemo(() => pageHtml(valid, theme), [valid, theme]);

  const { data: css, error } = useAsyncResult(
    () => compileTailwind(entryCss(theme), `${html} ${BODY_CLASS}`),
    [html, theme],
  );

  const files = useMemo(() => {
    if (target === "vite") return viteProject(valid, theme, title);
    if (target === "next") return nextProject(valid, theme, title);
    return htmlProject(valid, theme, title, css ?? "/* compiling… */");
  }, [target, valid, theme, title, css]);
  const paths = Object.keys(files).sort((a, b) =>
    a === MAIN_FILE[target] ? -1 : b === MAIN_FILE[target] ? 1 : a.localeCompare(b),
  );
  const current = files[file] !== undefined ? file : MAIN_FILE[target];

  const move = (i: number, d: -1 | 1) => {
    const next = [...valid];
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x!);
    setIds(next);
  };
  const remove = (id: string) => {
    const prev = valid;
    setIds(valid.filter((x) => x !== id));
    toast(`Removed ${sectionById.get(id)?.label ?? id}`, {
      action: { label: "Undo", onClick: () => setIds(prev) },
    });
  };
  const reset = () => {
    const prev = valid;
    setIds(preset.sections);
    toast("Sections reset", { action: { label: "Undo", onClick: () => setIds(prev) } });
  };

  const download = async () => {
    const { zipSync, strToU8 } = await import("fflate");
    const name = slug(title);
    const data = zipSync(
      Object.fromEntries(Object.entries(files).map(([p, c]) => [`${name}/${p}`, strToU8(c)])),
    );
    const ok = await saveBlob(new Blob([data], { type: "application/zip" }), `${name}.zip`);
    if (ok) toast.success(`Saved ${name}.zip`);
  };

  const createFolder = async () => {
    try {
      const parent = await pickFolder("Where should the project folder go?");
      if (!parent) return;
      const dir = await writeProject(joinPath(parent, slug(title)), files);
      toast.success(`Created ${slug(title)}`, {
        description: dir,
        action: {
          label: "Open in VS Code",
          onClick: () =>
            void openInVsCode(dir).catch((e: unknown) =>
              toast.error(e instanceof Error ? e.message : String(e)),
            ),
        },
        duration: 10000,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  };

  const available = sections.filter((s) => !valid.includes(s.id));

  return (
    <div className="@container flex h-full flex-col">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold">{preset.title}</h2>
          <p className="text-xs text-muted-foreground">
            {preset.description}. Pick sections, set your brand, export a ready project.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Segmented
            label="Export as"
            value={target}
            onChange={(t) => {
              setTarget(t);
              setFile(MAIN_FILE[t]);
            }}
            options={[
              { value: "vite", label: "React" },
              { value: "next", label: "Next.js" },
              { value: "html", label: "HTML" },
            ]}
          />
          {isDesktop() && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => void createFolder()}
              disabled={!valid.length || (target === "html" && !css)}
              title="Write the project into a new folder on your computer"
            >
              <FolderPlus /> Create folder
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => void download()}
            disabled={!valid.length || (target === "html" && !css)}
          >
            <Download /> Download .zip
          </Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-auto @min-[860px]:grid-cols-[17rem_1fr] @min-[860px]:overflow-hidden">
        <aside className="flex flex-col gap-5 border-b p-4 @min-[860px]:overflow-auto @min-[860px]:border-r @min-[860px]:border-b-0">
          <section className="flex flex-col gap-3" aria-label="Brand">
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Brand
            </h3>
            <Field label="Site name">
              {(id) => (
                <Input id={id} value={theme.name} onChange={(e) => set("name", e.target.value)} />
              )}
            </Field>
            <ColorField label="Brand color" value={theme.brand} onChange={(v) => set("brand", v)} />
            <Segmented
              label="Mode"
              value={theme.mode}
              onChange={(v: Mode) => set("mode", v)}
              options={[
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
              ]}
            />
            <Segmented
              label="Corners"
              value={theme.radius}
              onChange={(v: Radius) => set("radius", v)}
              options={[
                { value: "sharp", label: "Sharp" },
                { value: "soft", label: "Soft" },
                { value: "round", label: "Round" },
              ]}
            />
            <SelectField
              label="Font"
              value={theme.font}
              onChange={(v: Font) => set("font", v)}
              options={(Object.keys(fonts) as Font[]).map((f) => ({
                value: f,
                label: fonts[f].label,
              }))}
            />
          </section>

          <section className="flex flex-col gap-2" aria-label="Sections">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Sections <span className="font-normal">({valid.length})</span>
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={reset}
                title="Back to the preset's sections"
              >
                <RotateCcw /> Reset
              </Button>
            </div>
            <ol className="flex flex-col gap-1">
              {valid.map((id, i) => {
                const s = sectionById.get(id)!;
                return (
                  <li
                    key={id}
                    className="group flex items-center gap-1 rounded-md border bg-card py-1 pr-1 pl-2.5"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm" title={s.description}>
                      {s.label}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Move ${s.label} up`}
                      disabled={i === 0}
                      onClick={() => move(i, -1)}
                    >
                      <ArrowUp />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Move ${s.label} down`}
                      disabled={i === valid.length - 1}
                      onClick={() => move(i, 1)}
                    >
                      <ArrowDown />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${s.label}`}
                      onClick={() => remove(id)}
                    >
                      <X />
                    </Button>
                  </li>
                );
              })}
            </ol>
            <label className="relative mt-1 flex items-center">
              <span className="sr-only">Add a section</span>
              <Plus className="pointer-events-none absolute left-2.5 size-4 text-muted-foreground" />
              <select
                value=""
                onChange={(e) => e.target.value && setIds([...valid, e.target.value])}
                className="h-8 w-full rounded-md border border-dashed border-input bg-background pr-2 pl-8 text-sm text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                <option value="">Add a section…</option>
                {CATEGORY_ORDER.map((cat) => {
                  const list = available.filter((s) => s.category === cat);
                  return list.length ? (
                    <optgroup key={cat} label={cat}>
                      {list.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </optgroup>
                  ) : null;
                })}
              </select>
            </label>
          </section>
        </aside>

        <div className="flex min-h-[70vh] min-w-0 flex-col gap-3 p-4 @min-[860px]:min-h-0">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <Segmented
              label="View"
              value={view}
              onChange={setView}
              options={[
                { value: "preview", label: "Preview" },
                { value: "code", label: "Code" },
              ]}
            />
            {view === "preview" ? (
              <Segmented
                label="Screen"
                value={device}
                onChange={setDevice}
                options={[
                  { value: "desktop", label: "Desktop" },
                  { value: "tablet", label: "Tablet" },
                  { value: "phone", label: "Phone" },
                ]}
              />
            ) : (
              <div className="w-64">
                <SelectField
                  label="File"
                  value={current}
                  onChange={setFile}
                  options={paths.map((p) => ({ value: p, label: p }))}
                />
              </div>
            )}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {!valid.length ? (
            <div className="grid flex-1 place-items-center rounded-lg border border-dashed text-sm text-muted-foreground">
              Add a section to start.
            </div>
          ) : view === "preview" ? (
            <SiteFrame html={html} css={css ?? ""} width={DEVICES[device]} />
          ) : (
            <OutputCode
              code={files[current] ?? ""}
              label={current}
              language={languageOf(current)}
              meta={`${paths.length} files`}
              className="min-h-0 flex-1 overflow-auto"
            />
          )}
        </div>
      </div>
    </div>
  );
}
