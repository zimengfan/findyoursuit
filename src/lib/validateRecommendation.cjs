function validateOutfitRecommendation(recommendation) {
  // Check if recommendation exists and is an object
  if (!recommendation || typeof recommendation !== 'object') {
    return false;
  }

  // Required top-level fields
  const requiredFields = ['suit', 'shirt', 'neckwear', 'shoes', 'accessories', 'justification', 'seasonalNotes', 'styleNotes'];
  if (!requiredFields.every(field => field in recommendation)) {
    return false;
  }

  // Validate suit object
  const suitFields = ['style', 'color', 'fabric', 'pattern', 'fit', 'justification'];
  if (!validateComponent(recommendation.suit, suitFields)) {
    return false;
  }

  // Validate shirt object
  const shirtFields = ['color', 'fabric', 'collar', 'cuffs', 'fit', 'justification'];
  if (!validateComponent(recommendation.shirt, shirtFields)) {
    return false;
  }

  // Validate neckwear object
  const neckwearFields = ['type', 'color', 'pattern', 'material', 'justification'];
  if (!validateComponent(recommendation.neckwear, neckwearFields)) {
    return false;
  }

  // Validate shoes object
  const shoesFields = ['type', 'color', 'material', 'style', 'justification'];
  if (!validateComponent(recommendation.shoes, shoesFields)) {
    return false;
  }

  // Validate arrays
  if (!Array.isArray(recommendation.accessories) ||
      !Array.isArray(recommendation.styleNotes)) {
    return false;
  }

  // Validate string fields
  if (typeof recommendation.justification !== 'string' ||
      typeof recommendation.seasonalNotes !== 'string') {
    return false;
  }

  // Validate optional layering object if present
  if (recommendation.layering) {
    if (typeof recommendation.layering !== 'object') {
      return false;
    }
    // Layering fields are optional, so we don't validate their presence
  }

  return true;
}

function validateComponent(component, requiredFields) {
  if (!component || typeof component !== 'object') {
    return false;
  }

  return requiredFields.every(field => {
    return field in component && typeof component[field] === 'string' && component[field].trim() !== '';
  });
}

module.exports = { validateOutfitRecommendation }; 