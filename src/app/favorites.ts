/** Modules whose items can be starred. (Library items are already "yours".) */
export const canFavorite = (moduleId: string) => moduleId !== "library";
