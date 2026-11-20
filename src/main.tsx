// First import on purpose: configures zod before any schema is parsed.
import "./lib/zod-config";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "./app/theme.css";
import { initTheme } from "./lib/store/theme";
import { router } from "./app/router";

initTheme();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
