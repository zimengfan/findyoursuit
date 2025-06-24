export function validateOutfitRecommendation(obj: any): boolean {
  if (!obj) return false;
  if (typeof obj !== 'object') return false;

  // Required top-level fields
  const required = ['suit', 'shirt', 'neckwear', 'shoes', 'accessories', 'justification', 'seasonalNotes', 'styleNotes'];
  for (const key of required) {
    if (!(key in obj)) return false;
  }

  // Validate suit object
  const suitFields = ['style', 'color', 'fabric', 'pattern', 'fit', 'pieces', 'justification'];
  if (!validateComponent(obj.suit, suitFields)) return false;

  // Validate shirt object
  const shirtFields = ['color', 'fabric', 'collar', 'cuffs', 'fit', 'justification'];
  if (!validateComponent(obj.shirt, shirtFields)) return false;

  // Validate neckwear object
  const neckwearFields = ['type', 'color', 'pattern', 'material', 'justification'];
  if (!validateComponent(obj.neckwear, neckwearFields)) return false;

  // Validate shoes object
  const shoesFields = ['type', 'color', 'material', 'style', 'justification'];
  if (!validateComponent(obj.shoes, shoesFields)) return false;

  // Validate arrays
  if (!Array.isArray(obj.accessories) || !Array.isArray(obj.styleNotes)) return false;

  // Validate string fields
  if (typeof obj.justification !== 'string' || typeof obj.seasonalNotes !== 'string') return false;

  // Validate optional layering object if present
  if (obj.layering) {
    if (typeof obj.layering !== 'object') return false;
    // Layering fields are optional, so we don't validate their presence
  }

  return true;
}

function validateComponent(obj: any, requiredFields: string[]): boolean {
  if (!obj || typeof obj !== 'object') return false;
  return requiredFields.every(field => field in obj && typeof obj[field] === 'string');
} 