import type { Section, SectionCategory } from "../model";
import { app } from "./app";
import { auth } from "./auth";
import { basics } from "./basics";
import { blog } from "./blog";
import { marketing } from "./marketing";
import { portfolio } from "./portfolio";
import { store } from "./store";

export const sections: Section[] = [
  ...basics,
  ...marketing,
  ...store,
  ...app,
  ...portfolio,
  ...blog,
  ...auth,
];

export const sectionById = new Map(sections.map((s) => [s.id, s]));

export const CATEGORY_ORDER: SectionCategory[] = [
  "Basics",
  "Marketing",
  "Store",
  "App",
  "Portfolio",
  "Blog",
  "Auth",
];
