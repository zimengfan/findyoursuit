function validateOutfitRecommendation(recommendation) {
  // Check if recommendation exists and is an object
  if (!recommendation || typeof recommendation !== 'object') {
    return false;
  }

  // Required top-level fields
  const requiredFields = ['suit', 'shirt', 'tie', 'shoes', 'accessories', 'justification', 'seasonalNotes', 'styleNotes'];
  if (!requiredFields.every(field => field in recommendation)) {
    return false;
  }

  // Validate suit object
  const suitFields = ['color', 'fabric', 'pattern', 'fit', 'justification'];
  if (!validateComponent(recommendation.suit, suitFields)) {
    return false;
  }

  // Validate shirt object
  const shirtFields = ['color', 'fabric', 'collar', 'fit', 'justification'];
  if (!validateComponent(recommendation.shirt, shirtFields)) {
    return false;
  }

  // Validate tie object
  const tieFields = ['color', 'pattern', 'material', 'justification'];
  if (!validateComponent(recommendation.tie, tieFields)) {
    return false;
  }

  // Validate shoes object
  const shoesFields = ['type', 'color', 'material', 'justification'];
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