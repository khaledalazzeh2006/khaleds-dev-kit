/** Display names and list order for the frameworks in content/commands. */
export const frameworks: Record<string, { label: string; order: number }> = {
  npm: { label: "npm", order: 10 },
  pnpm: { label: "pnpm", order: 20 },
  git: { label: "Git", order: 30 },
  "vite-react": { label: "React (Vite)", order: 40 },
  nextjs: { label: "Next.js", order: 50 },
  express: { label: "Express", order: 60 },
  nestjs: { label: "NestJS", order: 70 },
  prisma: { label: "Prisma", order: 80 },
  threejs: { label: "Three.js / R3F", order: 90 },
  "gltf-transform": { label: "glTF Transform", order: 100 },
};

export function frameworkLabel(id: string): string {
  return frameworks[id]?.label ?? id;
}

export function frameworkOrder(id: string): number {
  return frameworks[id]?.order ?? 999;
}
