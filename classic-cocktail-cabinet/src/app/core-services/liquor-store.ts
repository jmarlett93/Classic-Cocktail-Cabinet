import { Liqour, LiqourType, liquors } from '../models/recipe-book';

// Helper function to find liquors by tags
export const findLiquorsByTags = (tags: string[]): Liqour[] => {
  if (!tags || tags.length === 0) return [];

  return liquors
    .filter((liquor) => tags.some((tag) => liquor.tags.includes(tag)))
    .sort((a, b) => {
      // Sort by number of matching tags (descending)
      const aMatches = a.tags.filter((tag) => tags.includes(tag)).length;
      const bMatches = b.tags.filter((tag) => tags.includes(tag)).length;
      return bMatches - aMatches;
    });
};

// Helper function to find liquors by type
export const findLiquorsByType = (type: LiqourType): Liqour[] => {
  return liquors.filter((liquor) => liquor.type === type);
};

// Helper function to get all unique tags from the liquor database
export const getAllTags = (): string[] => {
  const tagsSet = new Set<string>();

  liquors.forEach((liquor) => {
    liquor.tags.forEach((tag) => tagsSet.add(tag));
  });

  return Array.from(tagsSet);
};

// Helper function to get all liquor types
export const getAllLiquorTypes = (): LiqourType[] => {
  return Object.values(LiqourType);
};
