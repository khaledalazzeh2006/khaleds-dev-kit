import { icon } from "../icons";
import { esc, ui, type Section } from "../model";
import type { SiteTheme } from "../theme";

const shell = (
  t: SiteTheme,
  body: string,
) => `<section class="grid min-h-screen place-items-center bg-soft px-6 py-16">
  <div class="w-full max-w-md">
    <a href="#" class="mx-auto flex w-fit items-center gap-2 text-xl font-bold"><span class="grid size-9 place-items-center rounded-btn bg-brand text-on-brand">${icon("zap", "size-4")}</span>${esc(t.name)}</a>
    <div class="mt-8 ${ui.card} p-8 shadow-sm">
${body}
    </div>
  </div>
</section>`;

const field = (id: string, label: string, type: string, extra = "") =>
  `        <div class="grid gap-2"><label for="${id}" class="${ui.label}">${label}</label><input id="${id}" type="${type}" required class="${ui.input}"${extra} /></div>`;

export const auth: Section[] = [
  {
    id: "login",
    component: "Login",
    label: "Login",
    category: "Auth",
    description: "Email + password sign-in card",
    render: (t) =>
      shell(
        t,
        `      <h1 class="text-2xl font-bold tracking-tight">Welcome back</h1>
      <p class="mt-1 text-sm text-muted">Sign in to continue to ${esc(t.name)}.</p>
      <form class="mt-8 grid gap-5">
${field("login-email", "Email", "email", ' autocomplete="email" placeholder="you@example.com"')}
        <div class="grid gap-2">
          <div class="flex items-center justify-between"><label for="login-password" class="${ui.label}">Password</label><a href="#" class="text-sm font-medium text-brand">Forgot password?</a></div>
          <input id="login-password" type="password" required autocomplete="current-password" class="${ui.input}" />
        </div>
        <label class="flex items-center gap-2 text-sm text-muted"><input type="checkbox" class="size-4 accent-brand" /> Remember me</label>
        <button type="submit" class="${ui.btn}">Sign in</button>
      </form>
      <p class="mt-6 text-center text-sm text-muted">No account? <a href="#" class="font-semibold text-brand">Create one</a></p>`,
      ),
  },
  {
    id: "register",
    component: "Register",
    label: "Sign up",
    category: "Auth",
    description: "Name, email, password and terms",
    render: (t) =>
      shell(
        t,
        `      <h1 class="text-2xl font-bold tracking-tight">Create your account</h1>
      <p class="mt-1 text-sm text-muted">Start free. No credit card required.</p>
      <form class="mt-8 grid gap-5">
${field("register-name", "Full name", "text", ' autocomplete="name"')}
${field("register-email", "Email", "email", ' autocomplete="email" placeholder="you@example.com"')}
${field("register-password", "Password", "password", ' autocomplete="new-password" minlength="8"')}
        <p class="-mt-3 text-xs text-muted">At least 8 characters.</p>
        <label class="flex items-start gap-2 text-sm text-muted"><input type="checkbox" required class="mt-0.5 size-4 accent-brand" /> <span>I agree to the <a href="#" class="font-medium text-ink underline">Terms</a> and <a href="#" class="font-medium text-ink underline">Privacy Policy</a>.</span></label>
        <button type="submit" class="${ui.btn}">Create account</button>
      </form>
      <p class="mt-6 text-center text-sm text-muted">Already have an account? <a href="#" class="font-semibold text-brand">Sign in</a></p>`,
      ),
  },
  {
    id: "forgot",
    component: "ForgotPassword",
    label: "Forgot password",
    category: "Auth",
    description: "Request a reset link",
    render: (t) =>
      shell(
        t,
        `      <span class="grid size-12 place-items-center rounded-full bg-brand/10 text-brand">${icon("lock")}</span>
      <h1 class="mt-5 text-2xl font-bold tracking-tight">Forgot your password?</h1>
      <p class="mt-1 text-sm text-muted">Enter your email and we’ll send you a link to reset it.</p>
      <form class="mt-8 grid gap-5">
${field("forgot-email", "Email", "email", ' autocomplete="email" placeholder="you@example.com"')}
        <button type="submit" class="${ui.btn}">Send reset link</button>
      </form>
      <p class="mt-6 text-center text-sm text-muted"><a href="#" class="font-semibold text-brand">Back to sign in</a></p>`,
      ),
  },
];
