import { icon } from "../icons";
import { ui, type Section } from "../model";

const posts = [
  [
    "Design",
    "How we cut our page load time in half",
    "Small changes, measured carefully, added up to a much faster site.",
    "Nov 12, 2026",
    "6 min",
  ],
  [
    "Engineering",
    "A calm approach to database migrations",
    "Ship schema changes without downtime or late-night surprises.",
    "Nov 3, 2026",
    "8 min",
  ],
  [
    "Product",
    "What we learned from 100 customer calls",
    "The patterns that changed our roadmap, and the ones that didn’t.",
    "Oct 21, 2026",
    "5 min",
  ],
  [
    "Guides",
    "Getting started with scroll animations",
    "A friendly introduction to ScrollTrigger, with copy-paste examples.",
    "Oct 9, 2026",
    "7 min",
  ],
  [
    "Engineering",
    "Choosing between REST and GraphQL",
    "A practical comparison for small teams with real deadlines.",
    "Sep 28, 2026",
    "9 min",
  ],
  [
    "Design",
    "Color systems that survive dark mode",
    "Build palettes once and let them adapt everywhere.",
    "Sep 15, 2026",
    "4 min",
  ],
] as const;

export const blog: Section[] = [
  {
    id: "blog-hero",
    component: "BlogHeader",
    label: "Blog header",
    category: "Blog",
    description: "Title, intro and topic filters",
    render: () => `<section class="pt-20 pb-10">
  <div class="${ui.container} text-center">
    <p class="${ui.eyebrow}">Blog</p>
    <h1 class="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">Notes on building for the web</h1>
    <p class="mx-auto mt-4 max-w-xl text-lg text-muted">Guides, stories and lessons from the team, every couple of weeks.</p>
    <div class="mt-8 flex flex-wrap justify-center gap-2 text-sm">
${["All", "Design", "Engineering", "Product", "Guides"].map((c, i) => `      <a href="#" class="rounded-full border px-4 py-1.5 font-medium ${i === 0 ? "border-brand bg-brand text-on-brand" : "border-line text-muted hover:text-ink"}">${c}</a>`).join("\n")}
    </div>
  </div>
</section>`,
  },
  {
    id: "posts",
    anchor: { id: "articles", label: "Articles" },
    component: "PostGrid",
    label: "Post grid",
    category: "Blog",
    description: "Featured post plus a grid of articles",
    render: () => {
      const [first, ...rest] = posts;
      const meta = (date: string, time: string) =>
        `<p class="flex items-center gap-2 text-xs text-muted">${date} · ${icon("clock", "size-3.5")} ${time} read</p>`;
      return `<section id="articles" class="pb-20">
  <div class="${ui.container}">
    <article class="group grid items-center gap-8 ${ui.card} overflow-hidden md:grid-cols-2">
      <div class="aspect-video h-full bg-linear-to-br from-brand/45 to-brand/5 md:aspect-auto md:min-h-80"></div>
      <div class="p-6 md:p-10">
        <span class="text-xs font-semibold tracking-wider text-brand uppercase">${first[0]} · Featured</span>
        <h2 class="mt-3 text-2xl font-bold tracking-tight md:text-3xl"><a href="#" class="group-hover:text-brand">${first[1]}</a></h2>
        <p class="mt-3 text-muted">${first[2]}</p>
        <div class="mt-6">${meta(first[3], first[4])}</div>
      </div>
    </article>
    <div class="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
${rest
  .map(
    ([cat, title, text, date, time], i) => `      <article class="group">
        <div class="aspect-video rounded-card bg-linear-to-br ${i % 2 ? "from-ink/15 to-soft" : "from-brand/30 to-soft"}"></div>
        <span class="mt-4 block text-xs font-semibold tracking-wider text-brand uppercase">${cat}</span>
        <h3 class="mt-2 text-lg font-semibold"><a href="#" class="group-hover:text-brand">${title}</a></h3>
        <p class="mt-2 text-sm text-muted">${text}</p>
        <div class="mt-3">${meta(date, time)}</div>
      </article>`,
  )
  .join("\n")}
    </div>
    <div class="mt-12 flex justify-center"><a href="#" class="${ui.btnGhost}">Load more posts</a></div>
  </div>
</section>`;
    },
  },
  {
    id: "article",
    component: "Article",
    label: "Article",
    category: "Blog",
    description: "Readable post layout with author and quote",
    render: () => `<article class="py-16 md:py-24">
  <div class="${ui.container} max-w-3xl">
    <a href="#" class="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink">${icon("arrow-right", "size-4 rotate-180")} All posts</a>
    <p class="mt-8 text-xs font-semibold tracking-wider text-brand uppercase">Guides</p>
    <h1 class="mt-3 text-4xl font-extrabold tracking-tight text-balance md:text-5xl">Getting started with scroll animations</h1>
    <div class="mt-6 flex items-center gap-3 text-sm">
      <span class="grid size-10 place-items-center rounded-full bg-brand/15 font-bold text-brand">LN</span>
      <div><p class="font-semibold">Lina Nasser</p><p class="text-muted">Oct 9, 2026 · 7 min read</p></div>
    </div>
    <div class="mt-10 aspect-video rounded-card bg-linear-to-br from-brand/40 to-soft"></div>
    <div class="mt-10 space-y-6 text-lg leading-relaxed text-ink/90">
      <p>Scroll animations make a page feel alive, but only when they support the story. In this guide we start small: fade a heading in as it enters the screen, then pin a section while its content changes.</p>
      <h2 class="pt-4 text-2xl font-bold tracking-tight text-ink">Start with the content</h2>
      <p>Write the page first, as if nothing moves. If it reads well without animation, motion will make it better. If it doesn’t, motion will only hide the problem.</p>
      <blockquote class="border-l-4 border-brand pl-6 text-xl font-medium text-ink">“Animate to explain, not to decorate.”</blockquote>
      <h2 class="pt-4 text-2xl font-bold tracking-tight text-ink">Keep it fast</h2>
      <p>Animate <code class="rounded bg-soft px-1.5 py-0.5 font-mono text-base">transform</code> and <code class="rounded bg-soft px-1.5 py-0.5 font-mono text-base">opacity</code> only, respect reduced-motion settings, and test on a slow phone before you ship.</p>
      <ul class="list-disc space-y-2 pl-6 marker:text-brand">
        <li>One idea per animation.</li>
        <li>Short durations: 0.3–0.8 seconds.</li>
        <li>Ease out when things arrive, ease in when they leave.</li>
      </ul>
    </div>
    <div class="mt-12 flex flex-wrap gap-2 border-t border-line pt-8">${["GSAP", "CSS", "Performance"].map((x) => `<span class="rounded-full bg-soft px-3 py-1 text-sm">${x}</span>`).join("")}</div>
  </div>
</article>`,
  },
];
