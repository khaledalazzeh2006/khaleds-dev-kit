import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { RootLayout } from "./root-layout";
import { AppFrame } from "./frame/app-frame";
import { RouteError } from "./route-error";
import { getModule, modules } from "./registry";

function firstItemId(moduleId: string) {
  return getModule(moduleId)?.items()[0]?.id;
}

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => {
    throw redirect({ to: "/" });
  },
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    const m = modules[0];
    const itemId = m && firstItemId(m.id);
    if (m && itemId)
      throw redirect({ to: "/$moduleId/$itemId", params: { moduleId: m.id, itemId } });
  },
});

const moduleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "$moduleId",
  beforeLoad: ({ params }) => {
    const itemId = firstItemId(params.moduleId);
    if (!itemId) throw redirect({ to: "/" });
    throw redirect({ to: "/$moduleId/$itemId", params: { moduleId: params.moduleId, itemId } });
  },
});

const itemRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "$moduleId/$itemId",
  beforeLoad: ({ params }) => {
    const m = getModule(params.moduleId);
    if (!m) throw redirect({ to: "/" });
    if (!m.items().some((i) => i.id === params.itemId)) {
      throw redirect({ to: "/$moduleId", params: { moduleId: m.id } });
    }
  },
  component: AppFrame,
});

const routeTree = rootRoute.addChildren([indexRoute, moduleRoute, itemRoute]);

// Hash history: deep links keep working in the packaged app (no server to rewrite paths).
export const router = createRouter({
  routeTree,
  history: createHashHistory(),
  defaultErrorComponent: RouteError,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
