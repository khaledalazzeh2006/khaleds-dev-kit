import { icon } from "../icons";
import { esc, ui, type Section } from "../model";

export const portfolio: Section[] = [
  {
    id: "about",
    component: "AboutHero",
    label: "About me (hero)",
    category: "Portfolio",
    description: "Name, role, short bio, availability",
    render: (t) => `<section class="py-20 md:py-28">
  <div class="${ui.container} grid items-center gap-12 md:grid-cols-[1.4fr_1fr]">
    <div>
      <span class="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs font-medium text-muted"><span class="size-2 rounded-full bg-brand"></span>Available for new projects</span>
      <h1 class="mt-6 text-4xl font-extrabold tracking-tight text-balance md:text-6xl">Hi, I’m ${esc(t.name)}. I build fast, friendly websites.</h1>
      <p class="mt-6 max-w-xl text-lg text-muted">Web developer focused on clean interfaces, smooth animation and code that’s easy to maintain. Currently building with React, Next.js and Node.</p>
      <div class="mt-8 flex flex-wrap gap-3">
        <a href="#projects" class="${ui.btn}">See my work ${icon("arrow-right", "size-4")}</a>
        <a href="#contact" class="${ui.btnGhost}">${icon("mail", "size-4")} Get in touch</a>
      </div>
    </div>
    <div class="relative mx-auto w-full max-w-sm">
      <div class="aspect-square rounded-full bg-linear-to-br from-brand/50 via-brand/20 to-soft"></div>
      <div class="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2 ${ui.card} px-4 py-2 text-sm font-medium shadow-lg">${icon("code", "size-4 text-brand")} 5+ years of building</div>
    </div>
  </div>
</section>`,
  },
  {
    id: "projects",
    anchor: { id: "projects", label: "Work" },
    component: "Projects",
    label: "Projects",
    category: "Portfolio",
    description: "Project cards with tags and links",
    render: () => {
      const projects = [
        [
          "Orbit Watch",
          "Scroll-driven 3D product page with GSAP and Three.js.",
          ["Three.js", "GSAP", "Vite"],
        ],
        [
          "Print Flow",
          "Work-order system for a printing press: jobs, stages and reports.",
          ["Next.js", "NestJS", "PostgreSQL"],
        ],
        [
          "Dev Kit",
          "Desktop toolbox for web developers, fully offline.",
          ["Tauri", "React", "Rust"],
        ],
        [
          "Taskly",
          "Task manager with boards, reminders and dark mode.",
          ["React", "Node", "SQLite"],
        ],
      ] as const;
      return `<section id="projects" class="bg-soft ${ui.section}">
  <div class="${ui.container}">
    <p class="${ui.eyebrow}">Selected work</p>
    <h2 class="${ui.h2}">Projects</h2>
    <div class="mt-12 grid gap-6 md:grid-cols-2">
${projects
  .map(
    ([name, text, tags], i) => `      <article class="group ${ui.card} overflow-hidden">
        <div class="aspect-video bg-linear-to-br ${i % 2 ? "from-ink/20 to-soft" : "from-brand/40 to-brand/5"} transition duration-500 group-hover:scale-[1.02]"></div>
        <div class="p-6">
          <div class="flex items-start justify-between gap-4">
            <h3 class="text-lg font-semibold">${name}</h3>
            <a href="#" aria-label="Open ${name}" class="text-muted transition group-hover:translate-x-1 group-hover:text-brand">${icon("arrow-right")}</a>
          </div>
          <p class="mt-2 text-sm text-muted">${text}</p>
          <div class="mt-4 flex flex-wrap gap-2">${tags.map((tag) => `<span class="rounded-full bg-soft px-2.5 py-1 text-xs font-medium">${tag}</span>`).join("")}</div>
        </div>
      </article>`,
  )
  .join("\n")}
    </div>
  </div>
</section>`;
    },
  },
  {
    id: "skills",
    anchor: { id: "skills", label: "Skills" },
    component: "Skills",
    label: "Skills",
    category: "Portfolio",
    description: "Skill groups as tags",
    render: () => {
      const groups: [string, string[]][] = [
        ["Frontend", ["React", "Next.js", "TypeScript", "Tailwind CSS", "GSAP", "Three.js"]],
        ["Backend", ["Node.js", "Express", "NestJS", "REST APIs", "Prisma"]],
        ["Data & tools", ["PostgreSQL", "SQL Server", "Git", "Docker", "Figma"]],
      ];
      return `<section id="skills" class="${ui.section}">
  <div class="${ui.container}">
    <p class="${ui.eyebrow}">Toolbox</p>
    <h2 class="${ui.h2}">Skills</h2>
    <div class="mt-12 grid gap-6 md:grid-cols-3">
${groups
  .map(
    ([g, items]) => `      <div class="${ui.card} p-6">
        <h3 class="font-semibold">${g}</h3>
        <div class="mt-4 flex flex-wrap gap-2">${items.map((s) => `<span class="rounded-btn border border-line px-3 py-1.5 text-sm">${s}</span>`).join("")}</div>
      </div>`,
  )
  .join("\n")}
    </div>
  </div>
</section>`;
    },
  },
  {
    id: "timeline",
    anchor: { id: "experience", label: "Experience" },
    component: "Experience",
    label: "Experience timeline",
    category: "Portfolio",
    description: "Jobs and education in order",
    render: () => {
      const items = [
        [
          "briefcase",
          "2024 — now",
          "Web developer, Freelance",
          "Websites and web apps for small businesses and startups.",
        ],
        [
          "briefcase",
          "2022 — 2024",
          "Frontend developer, Studio North",
          "Built marketing sites and design systems for 20+ clients.",
        ],
        [
          "graduation-cap",
          "2020 — 2024",
          "B.Sc. Computer Science",
          "Focus on software engineering and databases.",
        ],
      ] as const;
      return `<section id="experience" class="bg-soft ${ui.section}">
  <div class="${ui.container} max-w-3xl">
    <p class="${ui.eyebrow}">Journey</p>
    <h2 class="${ui.h2}">Experience</h2>
    <ol class="mt-12 space-y-10 border-l border-line pl-8">
${items
  .map(
    ([i, when, title, text]) => `      <li class="relative">
        <span class="absolute top-0 -left-[2.85rem] grid size-9 place-items-center rounded-full border border-line bg-card text-brand">${icon(i, "size-4")}</span>
        <p class="text-sm text-muted">${when}</p>
        <h3 class="mt-1 font-semibold">${title}</h3>
        <p class="mt-2 text-muted">${text}</p>
      </li>`,
  )
  .join("\n")}
    </ol>
  </div>
</section>`;
    },
  },
];
