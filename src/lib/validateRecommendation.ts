export function validateOutfitRecommendation(obj: any): boolean {
  if (!obj) return false;
  if (typeof obj !== 'object') return false;
  const required = ['suit', 'shirt', 'tie', 'shoes', 'accessories', 'justification', 'imageQuery', 'seasonalNotes', 'styleNotes'];
  for (const key of required) {
    if (!(key in obj)) return false;
  }
  if (!Array.isArray(obj.accessories)) return false;
  if (!Array.isArray(obj.styleNotes)) return false;
  return true;
} 