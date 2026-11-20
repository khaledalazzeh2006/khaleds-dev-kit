import { icon, type IconName } from "../icons";
import { esc, ui, type Section } from "../model";

export const app: Section[] = [
  {
    id: "dashboard",
    component: "Dashboard",
    label: "Admin dashboard",
    category: "App",
    description: "Sidebar, top bar, stat cards, chart and orders table",
    render: (t) => {
      const nav: [IconName, string, boolean][] = [
        ["house", "Overview", true],
        ["shopping-cart", "Orders", false],
        ["package", "Products", false],
        ["users", "Customers", false],
        ["chart-column", "Reports", false],
        ["settings", "Settings", false],
      ];
      const stats: [IconName, string, string, string][] = [
        ["dollar-sign", "Revenue", "$48,290", "+12.4%"],
        ["shopping-cart", "Orders", "1,284", "+8.1%"],
        ["users", "New customers", "312", "+3.2%"],
        ["trending-up", "Conversion", "3.6%", "+0.4%"],
      ];
      const bars = [42, 58, 49, 71, 64, 80, 74, 92, 68, 85, 77, 96];
      const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
      const orders: [string, string, string, string][] = [
        ["#3210", "Sara Haddad", "$248.00", "Paid"],
        ["#3209", "Omar Khalil", "$79.00", "Pending"],
        ["#3208", "Lina Nasser", "$1,120.00", "Paid"],
        ["#3207", "Yousef Amin", "$54.00", "Refunded"],
        ["#3206", "Maya Saleh", "$312.50", "Paid"],
      ];
      const badge: Record<string, string> = {
        Paid: "bg-brand/10 text-brand",
        Pending: "bg-soft text-muted",
        Refunded: "bg-ink/10 text-ink",
      };
      return `<div class="flex min-h-screen bg-soft">
  <aside class="hidden w-64 shrink-0 flex-col border-r border-line bg-card p-4 md:flex">
    <a href="#" class="flex items-center gap-2 px-2 py-2 text-lg font-bold"><span class="grid size-8 place-items-center rounded-btn bg-brand text-on-brand">${icon("zap", "size-4")}</span>${esc(t.name)}</a>
    <nav class="mt-6 flex flex-1 flex-col gap-1 text-sm">
${nav
  .map(
    ([i, l, active]) =>
      `      <a href="#" class="flex items-center gap-3 rounded-btn px-3 py-2 font-medium ${active ? "bg-brand/10 text-brand" : "text-muted hover:bg-soft hover:text-ink"}">${icon(i, "size-4")}${l}</a>`,
  )
  .join("\n")}
    </nav>
    <div class="flex items-center gap-3 rounded-btn border border-line p-3">
      <span class="grid size-9 place-items-center rounded-full bg-brand/15 text-sm font-bold text-brand">KD</span>
      <div class="min-w-0 flex-1"><p class="truncate text-sm font-semibold">Khaled D.</p><p class="truncate text-xs text-muted">Admin</p></div>
      <a href="#" aria-label="Sign out" class="text-muted hover:text-ink">${icon("log-out", "size-4")}</a>
    </div>
  </aside>
  <div class="flex min-w-0 flex-1 flex-col">
    <header class="flex h-16 items-center gap-4 border-b border-line bg-card px-6">
      <form class="relative max-w-sm flex-1">
        <label for="dash-search" class="sr-only">Search</label>
        <span class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted">${icon("search", "size-4")}</span>
        <input id="dash-search" type="search" placeholder="Search orders, customers…" class="${ui.input} py-2 pl-9" />
      </form>
      <button type="button" aria-label="Notifications" class="relative ml-auto grid size-10 place-items-center rounded-btn hover:bg-soft">${icon("bell")}<span class="absolute top-2 right-2 size-2 rounded-full bg-brand"></span></button>
    </header>
    <main class="flex-1 space-y-6 p-6">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div><h1 class="text-2xl font-bold tracking-tight">Overview</h1><p class="text-sm text-muted">Here’s what happened this month.</p></div>
        <div class="flex gap-2"><button type="button" class="${ui.btnGhost} py-2">${icon("calendar", "size-4")} Last 30 days</button><button type="button" class="${ui.btn} py-2">${icon("file-text", "size-4")} Export</button></div>
      </div>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
${stats
  .map(
    ([i, l, v, d]) => `        <div class="${ui.card} p-5">
          <div class="flex items-center justify-between text-sm text-muted">${l}<span class="text-brand">${icon(i, "size-4")}</span></div>
          <p class="mt-3 text-2xl font-bold tracking-tight">${v}</p>
          <p class="mt-1 text-xs font-medium text-brand">${d} <span class="text-muted">vs last month</span></p>
        </div>`,
  )
  .join("\n")}
      </div>
      <div class="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div class="${ui.card} p-5">
          <div class="flex items-center justify-between"><h2 class="font-semibold">Revenue</h2><span class="text-xs text-muted">2026</span></div>
          <div class="mt-6 flex h-56 items-end gap-2 md:gap-3">
${bars.map((h, i) => `            <div class="flex h-full flex-1 flex-col justify-end gap-2 text-center"><div class="h-[${h}%] rounded-t-md ${i === bars.length - 1 ? "bg-brand" : "bg-brand/30"}"></div><span class="text-[10px] text-muted">${months[i]}</span></div>`).join("\n")}
          </div>
        </div>
        <div class="${ui.card} p-5">
          <h2 class="font-semibold">Top products</h2>
          <ul class="mt-4 space-y-4 text-sm">
${[
  ["Everyday Tote", 82],
  ["Linen Shirt", 64],
  ["Canvas Sneakers", 51],
  ["Desk Lamp", 37],
]
  .map(
    ([n, p]) =>
      `            <li><div class="flex justify-between"><span>${n}</span><span class="text-muted">${p}%</span></div><div class="mt-2 h-2 rounded-full bg-soft"><div class="h-2 w-[${p}%] rounded-full bg-brand"></div></div></li>`,
  )
  .join("\n")}
          </ul>
        </div>
      </div>
      <div class="${ui.card} overflow-hidden">
        <div class="flex items-center justify-between p-5"><h2 class="font-semibold">Recent orders</h2><a href="#" class="text-sm font-semibold text-brand">View all</a></div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-soft text-xs text-muted uppercase"><tr><th class="px-5 py-3 font-medium">Order</th><th class="px-5 py-3 font-medium">Customer</th><th class="px-5 py-3 font-medium">Amount</th><th class="px-5 py-3 font-medium">Status</th></tr></thead>
            <tbody class="divide-y divide-line">
${orders.map(([id, c, a, s]) => `              <tr class="hover:bg-soft/60"><td class="px-5 py-3 font-medium">${id}</td><td class="px-5 py-3">${c}</td><td class="px-5 py-3">${a}</td><td class="px-5 py-3"><span class="rounded-full px-2.5 py-1 text-xs font-medium ${badge[s]}">${s}</span></td></tr>`).join("\n")}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</div>`;
    },
  },
];
