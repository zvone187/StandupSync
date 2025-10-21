export const countBlockers = (blockers: string): number => {
  if (!blockers || blockers.trim() === '') return 0;
  
  // Count non-empty lines as separate blockers
  const lines = blockers.split('\n').filter(line => line.trim() !== '');
  return lines.length;
};

export const formatItemsToText = (items: string[]): string => {
  return items.filter(item => item.trim() !== '').join('\n');
};

export const formatTextToItems = (text: string): string[] => {
  if (!text || text.trim() === '') return [''];
  return text.split('\n');
};