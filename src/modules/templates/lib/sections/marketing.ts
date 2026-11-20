import { icon, type IconName } from "../icons";
import { esc, ui, type Section } from "../model";

/** A fake app window drawn with divs: a "screenshot" that needs no image file. */
const appMock = `<div class="${ui.card} overflow-hidden shadow-2xl shadow-brand/10">
        <div class="flex items-center gap-1.5 border-b border-line px-4 py-3">
          <span class="size-2.5 rounded-full bg-line"></span><span class="size-2.5 rounded-full bg-line"></span><span class="size-2.5 rounded-full bg-line"></span>
        </div>
        <div class="grid grid-cols-[7rem_1fr] gap-4 p-4">
          <div class="space-y-2">
            <div class="h-2.5 w-16 rounded-full bg-brand/60"></div>
            <div class="h-2.5 w-20 rounded-full bg-line"></div>
            <div class="h-2.5 w-14 rounded-full bg-line"></div>
            <div class="h-2.5 w-[4.5rem] rounded-full bg-line"></div>
          </div>
          <div class="space-y-3">
            <div class="grid grid-cols-3 gap-3">
              <div class="rounded-btn bg-soft p-3"><div class="h-2 w-10 rounded-full bg-line"></div><div class="mt-2 h-4 w-14 rounded-full bg-brand/70"></div></div>
              <div class="rounded-btn bg-soft p-3"><div class="h-2 w-10 rounded-full bg-line"></div><div class="mt-2 h-4 w-12 rounded-full bg-ink/70"></div></div>
              <div class="rounded-btn bg-soft p-3"><div class="h-2 w-10 rounded-full bg-line"></div><div class="mt-2 h-4 w-16 rounded-full bg-ink/70"></div></div>
            </div>
            <div class="flex h-28 items-end gap-2 rounded-btn bg-soft p-3">
              <div class="h-[40%] flex-1 rounded-t bg-brand/40"></div><div class="h-[65%] flex-1 rounded-t bg-brand/50"></div><div class="h-[50%] flex-1 rounded-t bg-brand/40"></div><div class="h-[80%] flex-1 rounded-t bg-brand/70"></div><div class="h-[60%] flex-1 rounded-t bg-brand/50"></div><div class="h-[95%] flex-1 rounded-t bg-brand"></div>
            </div>
          </div>
        </div>
      </div>`;

const features: [IconName, string, string][] = [
  ["zap", "Fast by default", "Pages load in a blink, on any connection and any device."],
  ["shield-check", "Secure", "Encryption, backups and access control are built in, not bolted on."],
  ["chart-column", "Clear insights", "See what matters with dashboards that explain themselves."],
  ["users", "Made for teams", "Invite people, set roles and work together in real time."],
  ["layers", "Works with your stack", "Connect the tools you already use in a couple of clicks."],
  [
    "sparkles",
    "Thoughtful details",
    "Keyboard shortcuts, dark mode and a UI that stays out of the way.",
  ],
];

export const marketing: Section[] = [
  {
    id: "hero-centered",
    component: "Hero",
    label: "Hero (centered)",
    category: "Marketing",
    description: "Big headline, two buttons, product mockup below",
    render: (t) => `<section class="relative overflow-hidden pt-20 pb-16 md:pt-28">
  <div class="absolute inset-x-0 -top-40 -z-10 mx-auto h-96 max-w-3xl rounded-full bg-brand/20 blur-3xl"></div>
  <div class="${ui.container} text-center">
    <a href="#" class="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-xs font-medium text-muted transition hover:text-ink">
      <span class="rounded-full bg-brand px-2 py-0.5 text-on-brand">New</span> ${esc(t.name)} 2.0 is here ${icon("arrow-right", "size-3.5")}
    </a>
    <h1 class="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-balance md:text-6xl">The simple way to build <span class="text-brand">something great</span></h1>
    <p class="mx-auto mt-6 max-w-2xl text-lg text-muted md:text-xl">Everything your team needs to plan, build and launch, in one calm place. No setup headaches, no learning curve.</p>
    <div class="mt-10 flex flex-wrap justify-center gap-3">
      <a href="#" class="${ui.btn}">Start for free ${icon("arrow-right", "size-4")}</a>
      <a href="#features" class="${ui.btnGhost}">See how it works</a>
    </div>
    <p class="mt-4 text-sm text-muted">Free 14-day trial · No credit card</p>
    <div class="mx-auto mt-16 max-w-4xl text-left">
      ${appMock}
    </div>
  </div>
</section>`,
  },
  {
    id: "hero-split",
    component: "HeroSplit",
    label: "Hero (split)",
    category: "Marketing",
    description: "Headline left, visual right; good for stores and apps",
    render: () => `<section class="overflow-hidden py-16 md:py-24">
  <div class="${ui.container} grid items-center gap-12 md:grid-cols-2">
    <div>
      <p class="${ui.eyebrow}">New season</p>
      <h1 class="mt-4 text-4xl font-extrabold tracking-tight text-balance md:text-6xl">Made to last. Designed to love.</h1>
      <p class="mt-6 max-w-lg text-lg text-muted">Everyday essentials, thoughtfully made from better materials. Free shipping on orders over $50.</p>
      <div class="mt-8 flex flex-wrap gap-3">
        <a href="#products" class="${ui.btn}">Shop now ${icon("arrow-right", "size-4")}</a>
        <a href="#categories" class="${ui.btnGhost}">Browse categories</a>
      </div>
      <div class="mt-10 flex gap-8 text-sm">
        <div><p class="text-2xl font-bold">4.9</p><p class="text-muted">Average rating</p></div>
        <div><p class="text-2xl font-bold">20k+</p><p class="text-muted">Happy customers</p></div>
        <div><p class="text-2xl font-bold">30 days</p><p class="text-muted">Free returns</p></div>
      </div>
    </div>
    <div class="relative">
      <div class="aspect-square rounded-card bg-linear-to-br from-brand/40 via-brand/15 to-soft"></div>
      <div class="absolute -bottom-6 -left-6 hidden ${ui.card} items-center gap-3 p-4 shadow-xl sm:flex">
        <span class="grid size-10 place-items-center rounded-btn bg-brand text-on-brand">${icon("truck")}</span>
        <div><p class="text-sm font-semibold">Free delivery</p><p class="text-xs text-muted">Arrives in 2–4 days</p></div>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: "logos",
    component: "LogoCloud",
    label: "Logo cloud",
    category: "Marketing",
    description: "“Trusted by” row of company names",
    render: () => `<section class="py-12">
  <div class="${ui.container}">
    <p class="text-center text-sm font-medium text-muted">Trusted by teams at</p>
    <div class="mt-6 grid grid-cols-2 items-center gap-8 text-center text-xl font-bold tracking-tight text-muted/70 sm:grid-cols-3 md:grid-cols-6">
      <span>Northwind</span><span>Globex</span><span>Initech</span><span>Umbrella</span><span>Hooli</span><span>Stark</span>
    </div>
  </div>
</section>`,
  },
  {
    id: "features",
    anchor: { id: "features", label: "Features" },
    component: "Features",
    label: "Features grid",
    category: "Marketing",
    description: "Six features with icons",
    render: () => `<section id="features" class="${ui.section}">
  <div class="${ui.container}">
    <div class="mx-auto max-w-2xl text-center">
      <p class="${ui.eyebrow}">Features</p>
      <h2 class="${ui.h2}">Everything you need, nothing you don’t</h2>
      <p class="${ui.lead}">Powerful on day one, still simple on day one hundred.</p>
    </div>
    <div class="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
${features
  .map(
    ([
      i,
      title,
      text,
    ]) => `      <div class="${ui.card} p-6 transition hover:-translate-y-1 hover:shadow-lg">
        <span class="grid size-11 place-items-center rounded-btn bg-brand/10 text-brand">${icon(i)}</span>
        <h3 class="mt-5 font-semibold">${title}</h3>
        <p class="mt-2 text-sm text-muted">${text}</p>
      </div>`,
  )
  .join("\n")}
    </div>
  </div>
</section>`,
  },
  {
    id: "feature-split",
    component: "FeatureSplit",
    label: "Feature with list",
    category: "Marketing",
    description: "One feature explained, checklist + visual",
    render: () => `<section class="bg-soft ${ui.section}">
  <div class="${ui.container} grid items-center gap-12 md:grid-cols-2">
    <div class="order-2 md:order-1">
      ${appMock}
    </div>
    <div class="order-1 md:order-2">
      <p class="${ui.eyebrow}">Workflow</p>
      <h2 class="${ui.h2}">From idea to launch without the chaos</h2>
      <p class="${ui.lead}">Plan the work, track progress and share results in one place, so nobody has to ask for a status update again.</p>
      <ul class="mt-8 space-y-4">
${[
  "Boards, lists and timelines that stay in sync",
  "Automatic reminders before deadlines slip",
  "Reports you can share with one link",
]
  .map(
    (x) =>
      `        <li class="flex gap-3"><span class="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand text-on-brand">${icon("check", "size-3.5")}</span>${x}</li>`,
  )
  .join("\n")}
      </ul>
    </div>
  </div>
</section>`,
  },
  {
    id: "stats",
    component: "Stats",
    label: "Stats",
    category: "Marketing",
    description: "Four big numbers",
    render: () => `<section class="py-16">
  <div class="${ui.container}">
    <dl class="grid grid-cols-2 gap-6 rounded-card border border-line p-8 text-center md:grid-cols-4">
${[
  ["12k+", "Active teams"],
  ["99.99%", "Uptime"],
  ["4.9/5", "Average rating"],
  ["24/7", "Support"],
]
  .map(
    ([n, l]) =>
      `      <div><dt class="text-sm text-muted">${l}</dt><dd class="mt-2 text-3xl font-bold tracking-tight md:text-4xl">${n}</dd></div>`,
  )
  .join("\n")}
    </dl>
  </div>
</section>`,
  },
  {
    id: "testimonials",
    component: "Testimonials",
    label: "Testimonials",
    category: "Marketing",
    description: "Three quotes with names and stars",
    render: () => {
      const people = [
        [
          "Sara Haddad",
          "Product lead, Northwind",
          "We moved our whole team over in a weekend. It just works, and people actually enjoy using it.",
        ],
        [
          "Omar Khalil",
          "Founder, Initech",
          "The best tool decision we made this year. We ship faster and argue less.",
        ],
        [
          "Lina Nasser",
          "Designer, Globex",
          "Clean, quick and thoughtful. It feels like it was made by people who care.",
        ],
      ] as const;
      const stars = Array.from({ length: 5 }, () => icon("star", "size-4 fill-current")).join("");
      return `<section class="${ui.section}">
  <div class="${ui.container}">
    <div class="mx-auto max-w-2xl text-center">
      <p class="${ui.eyebrow}">Testimonials</p>
      <h2 class="${ui.h2}">Loved by people who ship</h2>
    </div>
    <div class="mt-16 grid gap-6 md:grid-cols-3">
${people
  .map(
    ([name, role, quote]) => `      <figure class="${ui.card} flex flex-col p-6">
        <div class="flex gap-0.5 text-brand">${stars}</div>
        <blockquote class="mt-4 flex-1 text-ink">“${quote}”</blockquote>
        <figcaption class="mt-6 flex items-center gap-3">
          <span class="grid size-10 place-items-center rounded-full bg-brand/15 text-sm font-bold text-brand">${name
            .split(" ")
            .map((p) => p[0])
            .join("")}</span>
          <span><span class="block text-sm font-semibold">${name}</span><span class="block text-xs text-muted">${role}</span></span>
        </figcaption>
      </figure>`,
  )
  .join("\n")}
    </div>
  </div>
</section>`;
    },
  },
  {
    id: "pricing",
    anchor: { id: "pricing", label: "Pricing" },
    component: "Pricing",
    label: "Pricing",
    category: "Marketing",
    description: "Three plans, the middle one highlighted",
    render: () => {
      const plans: [string, string, string, string[], boolean][] = [
        [
          "Starter",
          "$0",
          "For personal projects",
          ["1 project", "Basic analytics", "Community support"],
          false,
        ],
        [
          "Pro",
          "$19",
          "For growing teams",
          ["Unlimited projects", "Advanced analytics", "Priority support", "Custom domain"],
          true,
        ],
        [
          "Team",
          "$49",
          "For larger organizations",
          ["Everything in Pro", "Roles & permissions", "SSO", "Dedicated manager"],
          false,
        ],
      ];
      return `<section id="pricing" class="bg-soft ${ui.section}">
  <div class="${ui.container}">
    <div class="mx-auto max-w-2xl text-center">
      <p class="${ui.eyebrow}">Pricing</p>
      <h2 class="${ui.h2}">Simple, honest pricing</h2>
      <p class="${ui.lead}">Start free. Upgrade when you need more.</p>
    </div>
    <div class="mt-16 grid items-start gap-6 md:grid-cols-3">
${plans
  .map(
    ([
      name,
      price,
      sub,
      perks,
      hot,
    ]) => `      <div class="relative flex flex-col rounded-card border p-8 ${hot ? "border-brand bg-card shadow-xl shadow-brand/10 md:-mt-4" : "border-line bg-card"}">
${hot ? `        <span class="absolute -top-3 left-8 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-on-brand">Most popular</span>\n` : ""}        <h3 class="font-semibold">${name}</h3>
        <p class="mt-1 text-sm text-muted">${sub}</p>
        <p class="mt-6"><span class="text-4xl font-bold tracking-tight">${price}</span><span class="text-muted">/month</span></p>
        <ul class="mt-8 flex-1 space-y-3 text-sm">
${perks.map((p) => `          <li class="flex items-center gap-2"><span class="text-brand">${icon("check", "size-4")}</span>${p}</li>`).join("\n")}
        </ul>
        <a href="#" class="${hot ? ui.btn : ui.btnGhost} mt-8">${price === "$0" ? "Start free" : `Choose ${name}`}</a>
      </div>`,
  )
  .join("\n")}
    </div>
  </div>
</section>`;
    },
  },
];
