const ignoredWords = new Set(["AND", "OF", "THE", "&"]);

export const generateCategoryCode = (categoryName) => {
  const normalizedName = categoryName.trim().toUpperCase();

  const words = normalizedName
    .split(/\s+/)
    .filter((word) => !ignoredWords.has(word));

  if (words.length === 0) {
    throw new Error("Category name must contain valid words");
  }

  // Single-word category
  if (words.length === 1) {
    return words[0].slice(0, 3);
  }

  // Two-word category
  if (words.length === 2) {
    return words[0].slice(0, 2) + words[1][0];
  }

  // Three or more words
  return words
    .slice(0, 3)
    .map((word) => word[0])
    .join("");
};
