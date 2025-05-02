/**
 * Merges multiple class strings and removes duplicates
 * This is a simplified version that doesn't use clsx or tailwind-merge
 */
export function cn(...inputs) {
  // Join all inputs and split by spaces
  const allClasses = inputs
    .filter(Boolean)
    .join(" ")
    .split(" ")
    .filter(Boolean);

  // Remove duplicates
  const uniqueClasses = [...new Set(allClasses)];

  // Join back to string
  return uniqueClasses.join(" ");
}
