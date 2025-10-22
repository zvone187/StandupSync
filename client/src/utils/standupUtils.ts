export const countBlockers = (blockers: string | string[]): number => {
  // Handle both string and array formats for backwards compatibility
  if (!blockers) return 0;

  // If it's an array, count non-empty items
  if (Array.isArray(blockers)) {
    return blockers.filter(item => item && item.trim() !== '').length;
  }

  // If it's a string, count non-empty lines
  if (typeof blockers === 'string') {
    if (blockers.trim() === '') return 0;
    const lines = blockers.split('\n').filter(line => line.trim() !== '');
    return lines.length;
  }

  return 0;
};

export const formatItemsToText = (items: string[]): string => {
  return items.filter(item => item.trim() !== '').join('\n');
};

export const formatTextToItems = (text: string): string[] => {
  if (!text || text.trim() === '') return [''];
  return text.split('\n');
};