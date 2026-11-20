import { icon } from "../icons";
import { esc, ui, type Section } from "../model";

const logo = (name: string) =>
  `<a href="#" class="flex items-center gap-2 text-lg font-bold tracking-tight">
        <span class="grid size-8 place-items-center rounded-btn bg-brand text-on-brand">${icon("zap", "size-4")}</span>
        ${esc(name)}
      </a>`;

export const basics: Section[] = [
  {
    id: "nav",
    component: "Navbar",
    label: "Navbar",
    category: "Basics",
    description: "Logo, links, call to action; menu folds on phones (no JavaScript)",
    render: (t, page) => {
      const links = page.anchors.slice(0, 5);
      // Marketing pages get Sign in + Get started; other pages (portfolio, blog) a contact button.
      const marketing = links.some((l) => l.id === "pricing");
      const hasContact = links.some((l) => l.id === "contact");
      const cta = marketing
        ? { href: "#", label: "Get started" }
        : hasContact
          ? { href: "#contact", label: "Get in touch" }
          : { href: "#", label: "Subscribe" };
      const desktop = links
        .map((l) => `<a href="#${l.id}" class="transition hover:text-ink">${l.label}</a>`)
        .join("\n      ");
      const mobile = links
        .map((l) => `<a href="#${l.id}" class="rounded-btn px-3 py-2 hover:bg-soft">${l.label}</a>`)
        .join("\n        ");
      const signIn = marketing
        ? `<a href="#" class="text-sm font-semibold text-muted transition hover:text-ink">Sign in</a>\n      `
        : "";
      return `<header class="sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur">
  <nav class="${ui.container} flex h-16 items-center justify-between gap-6">
    ${logo(t.name)}
    <div class="hidden items-center gap-8 text-sm font-medium text-muted md:flex">
      ${desktop}
    </div>
    <div class="hidden items-center gap-3 md:flex">
      ${signIn}<a href="${cta.href}" class="${ui.btn} px-4 py-2">${cta.label}</a>
    </div>
    <details class="relative md:hidden">
      <summary class="grid size-10 cursor-pointer list-none place-items-center rounded-btn border border-line" aria-label="Menu">${icon("menu")}</summary>
      <div class="absolute right-0 mt-2 flex w-56 flex-col gap-1 ${ui.card} p-2 text-sm shadow-lg">
        ${mobile}
        <a href="${cta.href}" class="${ui.btn} mt-1 py-2">${cta.label}</a>
      </div>
    </details>
  </nav>
</header>`;
    },
  },
  {
    id: "faq",
    anchor: { id: "faq", label: "FAQ" },
    component: "Faq",
    label: "FAQ",
    category: "Basics",
    description: "Questions that open and close (native <details>)",
    render: () => {
      const qa = [
        [
          "Is there a free plan?",
          "Yes. The Starter plan is free forever for personal projects, no card needed.",
        ],
        [
          "Can I cancel at any time?",
          "Of course. Cancel from your account settings and you keep access until the end of the billing period.",
        ],
        [
          "Do you offer refunds?",
          "If it’s not a fit in the first 14 days, write to us and we’ll refund you in full.",
        ],
        [
          "Is my data secure?",
          "Data is encrypted in transit and at rest, and you can export or delete it whenever you like.",
        ],
        [
          "Do you have team pricing?",
          "Yes. The Team plan includes shared workspaces, roles and priority support.",
        ],
      ];
      return `<section id="faq" class="${ui.section}">
  <div class="${ui.container} max-w-3xl">
    <div class="text-center">
      <p class="${ui.eyebrow}">FAQ</p>
      <h2 class="${ui.h2}">Questions, answered</h2>
    </div>
    <div class="mt-12 divide-y divide-line ${ui.card}">
${qa
  .map(
    ([q, a]) => `      <details class="group p-6">
        <summary class="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
          ${q}
          <span class="text-muted transition group-open:rotate-180">${icon("chevron-down")}</span>
        </summary>
        <p class="mt-3 text-muted">${a}</p>
      </details>`,
  )
  .join("\n")}
    </div>
  </div>
</section>`;
    },
  },
  {
    id: "cta",
    component: "CallToAction",
    label: "Call to action",
    category: "Basics",
    description: "Brand-colored band with two buttons",
    render: () => `<section class="py-20">
  <div class="${ui.container}">
    <div class="relative overflow-hidden rounded-card bg-brand px-8 py-16 text-center text-on-brand md:px-16">
      <div class="absolute -top-24 -right-24 size-72 rounded-full bg-white/10"></div>
      <div class="absolute -bottom-32 -left-20 size-80 rounded-full bg-black/10"></div>
      <div class="relative">
        <h2 class="text-3xl font-bold tracking-tight md:text-4xl">Ready to get started?</h2>
        <p class="mx-auto mt-4 max-w-xl text-lg opacity-85">Join thousands of teams who ship faster. Set up in minutes, cancel any time.</p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <a href="#" class="inline-flex items-center gap-2 rounded-btn bg-on-brand px-5 py-3 text-sm font-semibold text-brand transition hover:opacity-90">Start for free ${icon("arrow-right", "size-4")}</a>
          <a href="#contact" class="inline-flex items-center rounded-btn border border-current/30 px-5 py-3 text-sm font-semibold transition hover:bg-white/10">Talk to sales</a>
        </div>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: "newsletter",
    component: "Newsletter",
    label: "Newsletter",
    category: "Basics",
    description: "Email signup with a short promise",
    render: () => `<section class="bg-soft py-20">
  <div class="${ui.container} flex flex-col items-center gap-8 text-center md:flex-row md:justify-between md:text-left">
    <div class="max-w-lg">
      <h2 class="text-2xl font-bold tracking-tight md:text-3xl">Get the newsletter</h2>
      <p class="mt-2 text-muted">One useful email a month. No spam, unsubscribe in one click.</p>
    </div>
    <form class="flex w-full max-w-md flex-col gap-3 sm:flex-row">
      <label for="newsletter-email" class="sr-only">Email</label>
      <input id="newsletter-email" type="email" required placeholder="you@example.com" class="${ui.input}" />
      <button type="submit" class="${ui.btn} shrink-0">Subscribe</button>
    </form>
  </div>
</section>`,
  },
  {
    id: "contact",
    anchor: { id: "contact", label: "Contact" },
    component: "Contact",
    label: "Contact form",
    category: "Basics",
    description: "Contact details next to a message form",
    render: () => `<section id="contact" class="${ui.section}">
  <div class="${ui.container} grid gap-12 md:grid-cols-2">
    <div>
      <p class="${ui.eyebrow}">Contact</p>
      <h2 class="${ui.h2}">Let’s talk</h2>
      <p class="${ui.lead}">Questions, ideas or a project in mind? Send a message and we’ll reply within one working day.</p>
      <ul class="mt-8 space-y-4 text-sm">
        <li class="flex items-center gap-3"><span class="grid size-10 place-items-center rounded-btn bg-soft text-brand">${icon("mail")}</span>hello@example.com</li>
        <li class="flex items-center gap-3"><span class="grid size-10 place-items-center rounded-btn bg-soft text-brand">${icon("phone")}</span>+1 (555) 010-2030</li>
        <li class="flex items-center gap-3"><span class="grid size-10 place-items-center rounded-btn bg-soft text-brand">${icon("map-pin")}</span>Remote, worldwide</li>
      </ul>
    </div>
    <form class="${ui.card} grid gap-4 p-6 md:p-8">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="grid gap-2"><label for="contact-name" class="${ui.label}">Name</label><input id="contact-name" type="text" required class="${ui.input}" /></div>
        <div class="grid gap-2"><label for="contact-email" class="${ui.label}">Email</label><input id="contact-email" type="email" required class="${ui.input}" /></div>
      </div>
      <div class="grid gap-2"><label for="contact-message" class="${ui.label}">Message</label><textarea id="contact-message" rows="5" required class="${ui.input}"></textarea></div>
      <button type="submit" class="${ui.btn}">Send message</button>
    </form>
  </div>
</section>`,
  },
  {
    id: "footer",
    component: "Footer",
    label: "Footer",
    category: "Basics",
    description: "Link columns, social links and copyright",
    render: (t) => {
      const cols: [string, string[]][] = [
        ["Product", ["Features", "Pricing", "Changelog", "Roadmap"]],
        ["Company", ["About", "Blog", "Careers", "Contact"]],
        ["Legal", ["Privacy", "Terms", "Cookies"]],
      ];
      return `<footer class="border-t border-line">
  <div class="${ui.container} grid gap-10 py-14 md:grid-cols-[2fr_1fr_1fr_1fr]">
    <div>
      ${logo(t.name)}
      <p class="mt-4 max-w-xs text-sm text-muted">Tools that help small teams do big things. Made with care, everywhere.</p>
      <div class="mt-6 flex gap-2 text-muted">
        <a href="#" aria-label="Website" class="grid size-9 place-items-center rounded-btn border border-line transition hover:text-ink">${icon("globe", "size-4")}</a>
        <a href="#" aria-label="Email" class="grid size-9 place-items-center rounded-btn border border-line transition hover:text-ink">${icon("at-sign", "size-4")}</a>
        <a href="#" aria-label="RSS" class="grid size-9 place-items-center rounded-btn border border-line transition hover:text-ink">${icon("rss", "size-4")}</a>
      </div>
    </div>
${cols
  .map(
    ([title, links]) => `    <div>
      <h3 class="text-sm font-semibold">${title}</h3>
      <ul class="mt-4 space-y-3 text-sm text-muted">
${links.map((l) => `        <li><a href="#" class="transition hover:text-ink">${l}</a></li>`).join("\n")}
      </ul>
    </div>`,
  )
  .join("\n")}
  </div>
  <div class="border-t border-line">
    <p class="${ui.container} py-6 text-sm text-muted">© ${new Date().getFullYear()} ${esc(t.name)}. All rights reserved.</p>
  </div>
</footer>`;
    },
  },
];
