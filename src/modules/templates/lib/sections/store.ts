import { icon, type IconName } from "../icons";
import { esc, ui, type Section } from "../model";

const products: [string, string, string, number][] = [
  ["Everyday Tote", "Bags", "$48", 25],
  ["Linen Shirt", "Clothing", "$62", 40],
  ["Ceramic Mug", "Home", "$18", 55],
  ["Wool Beanie", "Accessories", "$24", 15],
  ["Canvas Sneakers", "Shoes", "$79", 35],
  ["Desk Lamp", "Home", "$54", 50],
  ["Leather Wallet", "Accessories", "$39", 20],
  ["Rain Jacket", "Clothing", "$120", 30],
];

/** Placeholder product image: a tinted gradient tile (swap for <img> later). */
const tile = (i: number, extra = "aspect-square") =>
  `<div class="${extra} rounded-card bg-linear-to-br ${
    [
      "from-brand/35 to-brand/5",
      "from-brand/20 to-soft",
      "from-ink/15 to-soft",
      "from-brand/45 to-brand/10",
    ][i % 4]
  }"></div>`;

const productCard = (
  [name, cat, price]: (typeof products)[number],
  i: number,
) => `      <article class="group">
        <a href="#" class="relative block">
          ${tile(i)}
          <span class="absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-card/90 text-muted opacity-0 shadow transition group-hover:opacity-100">${icon("heart", "size-4")}</span>
        </a>
        <div class="mt-3 flex items-start justify-between gap-2">
          <div>
            <h3 class="text-sm font-semibold"><a href="#">${name}</a></h3>
            <p class="text-xs text-muted">${cat}</p>
          </div>
          <p class="text-sm font-semibold">${price}</p>
        </div>
        <button type="button" class="${ui.btnGhost} mt-3 w-full py-2">${icon("shopping-cart", "size-4")} Add to cart</button>
      </article>`;

export const store: Section[] = [
  {
    id: "shop-nav",
    component: "ShopNavbar",
    label: "Store navbar",
    category: "Store",
    description: "Logo, categories, search and cart count",
    render: (
      t,
    ) => `<header class="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
  <div class="bg-brand py-2 text-center text-xs font-medium text-on-brand">Free shipping on orders over $50 · 30-day returns</div>
  <nav class="${ui.container} flex h-16 items-center gap-6">
    <a href="#" class="text-xl font-extrabold tracking-tight">${esc(t.name)}</a>
    <div class="hidden gap-6 text-sm font-medium text-muted lg:flex">
      <a href="#" class="hover:text-ink">New</a><a href="#" class="hover:text-ink">Clothing</a><a href="#" class="hover:text-ink">Home</a><a href="#" class="hover:text-ink">Accessories</a><a href="#" class="hover:text-ink">Sale</a>
    </div>
    <form class="relative ml-auto hidden max-w-xs flex-1 md:block">
      <label for="shop-search" class="sr-only">Search products</label>
      <span class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted">${icon("search", "size-4")}</span>
      <input id="shop-search" type="search" placeholder="Search products" class="${ui.input} py-2 pl-9" />
    </form>
    <div class="ml-auto flex items-center gap-1 md:ml-0">
      <a href="#" aria-label="Account" class="grid size-10 place-items-center rounded-btn hover:bg-soft">${icon("user")}</a>
      <a href="#" aria-label="Cart, 2 items" class="relative grid size-10 place-items-center rounded-btn hover:bg-soft">${icon("shopping-cart")}<span class="absolute top-1 right-1 grid size-4 place-items-center rounded-full bg-brand text-[10px] font-bold text-on-brand">2</span></a>
    </div>
  </nav>
</header>`,
  },
  {
    id: "categories",
    anchor: { id: "categories", label: "Categories" },
    component: "Categories",
    label: "Categories",
    category: "Store",
    description: "Four category tiles",
    render: () => `<section id="categories" class="py-16">
  <div class="${ui.container}">
    <div class="flex items-end justify-between">
      <h2 class="text-2xl font-bold tracking-tight md:text-3xl">Shop by category</h2>
      <a href="#" class="text-sm font-semibold text-brand">View all</a>
    </div>
    <div class="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
${["Clothing", "Home", "Accessories", "Shoes"]
  .map(
    (c, i) => `      <a href="#" class="group relative overflow-hidden rounded-card">
        ${tile(i + 1, "aspect-[4/5] transition duration-500 group-hover:scale-105")}
        <span class="absolute inset-x-3 bottom-3 rounded-btn bg-card/90 px-4 py-2 text-sm font-semibold backdrop-blur">${c}</span>
      </a>`,
  )
  .join("\n")}
    </div>
  </div>
</section>`,
  },
  {
    id: "products",
    anchor: { id: "products", label: "Shop" },
    component: "ProductGrid",
    label: "Product grid",
    category: "Store",
    description: "Eight products with price and add-to-cart",
    render: () => `<section id="products" class="py-16">
  <div class="${ui.container}">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold tracking-tight md:text-3xl">Best sellers</h2>
        <p class="mt-1 text-muted">Our most-loved pieces this month.</p>
      </div>
      <label class="flex items-center gap-2 text-sm text-muted">Sort
        <select class="rounded-btn border border-line bg-surface px-3 py-2 text-ink"><option>Popular</option><option>Newest</option><option>Price: low to high</option></select>
      </label>
    </div>
    <div class="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
${products.map(productCard).join("\n")}
    </div>
  </div>
</section>`,
  },
  {
    id: "promo",
    component: "PromoBanner",
    label: "Promo banner",
    category: "Store",
    description: "Sale banner with a code",
    render: () => `<section class="py-10">
  <div class="${ui.container}">
    <div class="grid items-center gap-6 rounded-card bg-ink p-8 text-surface md:grid-cols-[1fr_auto] md:p-12">
      <div>
        <p class="text-sm font-semibold tracking-wider text-brand uppercase">Limited time</p>
        <h2 class="mt-2 text-3xl font-bold tracking-tight md:text-4xl">20% off your first order</h2>
        <p class="mt-2 opacity-70">Use code <span class="rounded bg-surface/15 px-2 py-0.5 font-mono font-semibold">WELCOME20</span> at checkout.</p>
      </div>
      <a href="#products" class="${ui.btn}">Shop the sale</a>
    </div>
  </div>
</section>`,
  },
  {
    id: "perks",
    component: "StorePerks",
    label: "Store perks",
    category: "Store",
    description: "Shipping, returns, secure payment",
    render: () => {
      const perks: [IconName, string, string][] = [
        ["truck", "Free shipping", "On every order over $50"],
        ["rotate-ccw", "Easy returns", "30 days, no questions asked"],
        ["credit-card", "Secure payment", "Cards, wallets and more"],
        ["message-circle", "Real support", "Talk to a human, 7 days a week"],
      ];
      return `<section class="border-y border-line py-10">
  <div class="${ui.container} grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
${perks
  .map(
    ([i, t, s]) =>
      `    <div class="flex items-center gap-4"><span class="grid size-11 shrink-0 place-items-center rounded-btn bg-brand/10 text-brand">${icon(i)}</span><div><p class="text-sm font-semibold">${t}</p><p class="text-xs text-muted">${s}</p></div></div>`,
  )
  .join("\n")}
  </div>
</section>`;
    },
  },
  {
    id: "product-detail",
    component: "ProductDetail",
    label: "Product details",
    category: "Store",
    description: "Gallery, price, options, quantity, add to cart",
    render: () => `<section class="py-12 md:py-16">
  <div class="${ui.container}">
    <nav aria-label="Breadcrumb" class="text-sm text-muted"><a href="#" class="hover:text-ink">Home</a> / <a href="#" class="hover:text-ink">Bags</a> / <span class="text-ink">Everyday Tote</span></nav>
    <div class="mt-6 grid gap-10 md:grid-cols-2">
      <div class="grid gap-4">
        ${tile(0, "aspect-square")}
        <div class="grid grid-cols-4 gap-4">${[1, 2, 3, 0].map((i) => tile(i, "aspect-square")).join("")}</div>
      </div>
      <div>
        <h1 class="text-3xl font-bold tracking-tight md:text-4xl">Everyday Tote</h1>
        <div class="mt-3 flex items-center gap-2 text-sm">
          <span class="flex text-brand">${Array.from({ length: 5 }, () => icon("star", "size-4 fill-current")).join("")}</span>
          <span class="text-muted">4.9 · 312 reviews</span>
        </div>
        <p class="mt-6 text-3xl font-bold">$48</p>
        <p class="mt-4 text-muted">A roomy tote in heavy organic canvas with a padded laptop sleeve and an inside zip pocket. Built for daily use, gets better with age.</p>
        <fieldset class="mt-8">
          <legend class="${ui.label}">Color</legend>
          <div class="mt-3 flex gap-3">
            <label class="cursor-pointer"><input type="radio" name="color" class="peer sr-only" checked /><span class="block size-9 rounded-full bg-brand ring-offset-2 ring-offset-surface peer-checked:ring-2 peer-checked:ring-ink"></span><span class="sr-only">Brand</span></label>
            <label class="cursor-pointer"><input type="radio" name="color" class="peer sr-only" /><span class="block size-9 rounded-full bg-ink ring-offset-2 ring-offset-surface peer-checked:ring-2 peer-checked:ring-ink"></span><span class="sr-only">Black</span></label>
            <label class="cursor-pointer"><input type="radio" name="color" class="peer sr-only" /><span class="block size-9 rounded-full border border-line bg-soft ring-offset-2 ring-offset-surface peer-checked:ring-2 peer-checked:ring-ink"></span><span class="sr-only">Natural</span></label>
          </div>
        </fieldset>
        <fieldset class="mt-6">
          <legend class="${ui.label}">Size</legend>
          <div class="mt-3 flex gap-2">
${["S", "M", "L"].map((s, i) => `            <label class="cursor-pointer"><input type="radio" name="size" class="peer sr-only"${i === 1 ? " checked" : ""} /><span class="grid h-10 w-14 place-items-center rounded-btn border border-line text-sm font-medium peer-checked:border-brand peer-checked:bg-brand/10 peer-checked:text-brand">${s}</span></label>`).join("\n")}
          </div>
        </fieldset>
        <div class="mt-8 flex gap-3">
          <div class="flex items-center rounded-btn border border-line">
            <button type="button" aria-label="Less" class="grid size-12 place-items-center text-muted hover:text-ink">${icon("minus", "size-4")}</button>
            <span class="w-8 text-center font-semibold">1</span>
            <button type="button" aria-label="More" class="grid size-12 place-items-center text-muted hover:text-ink">${icon("plus", "size-4")}</button>
          </div>
          <button type="button" class="${ui.btn} flex-1">${icon("shopping-cart", "size-4")} Add to cart</button>
          <button type="button" aria-label="Save" class="${ui.btnGhost} px-4">${icon("heart", "size-4")}</button>
        </div>
        <ul class="mt-8 space-y-3 border-t border-line pt-6 text-sm text-muted">
          <li class="flex items-center gap-3">${icon("truck", "size-4")} Free delivery in 2–4 days</li>
          <li class="flex items-center gap-3">${icon("rotate-ccw", "size-4")} 30-day free returns</li>
        </ul>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: "cart",
    component: "Cart",
    label: "Cart",
    category: "Store",
    description: "Line items with order summary and checkout",
    render: () => {
      const lines = [products[0]!, products[2]!];
      return `<section class="py-12 md:py-16">
  <div class="${ui.container}">
    <h1 class="text-3xl font-bold tracking-tight">Your cart</h1>
    <div class="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
      <ul class="divide-y divide-line ${ui.card}">
${lines
  .map(
    ([name, cat, price], i) => `        <li class="flex gap-4 p-4 md:p-6">
          ${tile(i * 2, "size-24 shrink-0")}
          <div class="flex flex-1 flex-col">
            <div class="flex justify-between gap-4"><div><p class="font-semibold">${name}</p><p class="text-sm text-muted">${cat}</p></div><p class="font-semibold">${price}</p></div>
            <div class="mt-auto flex items-center justify-between">
              <label class="flex items-center gap-2 text-sm text-muted">Qty <select class="rounded-btn border border-line bg-surface px-2 py-1 text-ink"><option>1</option><option>2</option><option>3</option></select></label>
              <button type="button" class="text-sm font-medium text-muted hover:text-ink">Remove</button>
            </div>
          </div>
        </li>`,
  )
  .join("\n")}
      </ul>
      <aside class="${ui.card} h-fit p-6">
        <h2 class="font-semibold">Order summary</h2>
        <dl class="mt-6 space-y-3 text-sm">
          <div class="flex justify-between"><dt class="text-muted">Subtotal</dt><dd>$66.00</dd></div>
          <div class="flex justify-between"><dt class="text-muted">Shipping</dt><dd>Free</dd></div>
          <div class="flex justify-between"><dt class="text-muted">Tax</dt><dd>$5.28</dd></div>
          <div class="flex justify-between border-t border-line pt-3 text-base font-semibold"><dt>Total</dt><dd>$71.28</dd></div>
        </dl>
        <a href="#" class="${ui.btn} mt-6 w-full">Checkout ${icon("arrow-right", "size-4")}</a>
        <p class="mt-3 flex items-center justify-center gap-2 text-xs text-muted">${icon("lock", "size-3.5")} Secure checkout</p>
      </aside>
    </div>
  </div>
</section>`;
    },
  },
];
