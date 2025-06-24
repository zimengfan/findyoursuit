import { UserPreferences } from '@/pages/Recommendations';

export interface OutfitRecommendation {
  suit: {
    color: string;
    style: string;
    fabric: string;
    pattern: string;
    fit: string;
    pieces: string[];
    justification: string;
  };
  shirt: {
    color: string;
    fabric: string;
    collar: string;
    cuffs: string;
    fit: string;
    justification: string;
  };
  neckwear: {
    type: string;
    color: string;
    pattern: string;
    material: string;
    justification: string;
  };
  shoes: {
    type: string;
    color: string;
    material: string;
    style: string;
    justification: string;
  };
  accessories: string[];
  layering?: {
    outerwear?: string;
    vest?: string;
    pocket_square?: string;
  };
  justification: string;
  seasonalNotes: string;
  styleNotes: string[];
  images?: string[];
}

export const generateRecommendation = async (preferences: UserPreferences): Promise<OutfitRecommendation> => {
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Generate recommendation based on preferences
  const recommendation = createRecommendation(preferences);
  
  console.log('Generated recommendation for preferences:', preferences);
  console.log('Recommendation result:', recommendation);
  
  return recommendation;
};

const createRecommendation = (prefs: UserPreferences): OutfitRecommendation => {
  // Suit recommendations based on occasion and formality
  const suitRecommendation = getSuitRecommendation(prefs);
  const shirtRecommendation = getShirtRecommendation(prefs, suitRecommendation);
  const neckwearRecommendation = getNeckwearRecommendation(prefs, suitRecommendation, shirtRecommendation);
  const shoesRecommendation = getShoesRecommendation(prefs, suitRecommendation);
  const accessories = getAccessories(prefs);

  // Generate justification
  const justification = generateJustification(prefs, suitRecommendation, shirtRecommendation, neckwearRecommendation);
  
  // Create image query for visual representation
  const imageQuery = `${suitRecommendation.color} ${suitRecommendation.fit} suit with ${shirtRecommendation.color} ${shirtRecommendation.collar} shirt and ${neckwearRecommendation.color} ${neckwearRecommendation.type}, ${shoesRecommendation.color} ${shoesRecommendation.type}, professional photography, full-body shot, elegant styling`;

  // Seasonal notes
  const seasonalNotes = getSeasonalNotes(prefs);
  const styleNotes = getStyleNotes(prefs);

  return {
    suit: suitRecommendation,
    shirt: shirtRecommendation,
    neckwear: neckwearRecommendation,
    shoes: shoesRecommendation,
    accessories,
    justification,
    seasonalNotes,
    styleNotes
  };
};

const getSuitRecommendation = (prefs: UserPreferences) => {
  let color = 'Navy';
  let style = 'Single-breasted';
  let fabric = 'Wool';
  let pattern = 'Solid';
  let fit = 'Tailored';
  let pieces = ['Jacket', 'Trousers'];
  let justification = 'Classic and versatile choice for any occasion';

  // Color based on occasion and preference
  switch (prefs.occasion) {
    case 'wedding':
      color = prefs.colorPreference === 'light' ? 'Light Gray' : 'Navy';
      break;
    case 'interview':
    case 'business':
      color = prefs.colorPreference === 'classic' ? 'Charcoal' : 'Navy';
      break;
    case 'gala':
    case 'funeral':
      color = 'Charcoal';
      break;
    case 'date':
    case 'cocktail':
      color = prefs.colorPreference === 'bold' ? 'Burgundy' : 'Navy';
      break;
    default:
      color = 'Navy';
  }

  // Fit based on body type
  switch (prefs.bodyType) {
    case 'slim':
      fit = 'Slim-fit';
      break;
    case 'athletic':
      fit = 'Tailored';
      break;
    case 'broad':
      fit = 'Classic';
      break;
    default:
      fit = 'Modern';
  }

  // Fabric based on season
  switch (prefs.season) {
    case 'summer':
      fabric = 'Lightweight Wool';
      break;
    case 'winter':
      fabric = 'Heavy Wool';
      break;
    case 'spring':
    case 'fall':
      fabric = 'Medium-weight Wool';
      break;
    default:
      fabric = 'Wool';
  }

  // Style based on formality
  if (prefs.formalityLevel === 'black-tie') {
    style = 'Tuxedo';
    color = 'Black';
  }

  return { color, style, fabric, pattern, fit, pieces, justification };
};

const getShirtRecommendation = (prefs: UserPreferences, suit: any) => {
  let color = 'White';
  let fabric = 'Cotton';
  let collar = 'Spread';
  let cuffs = 'Barrel';
  let fit = 'Slim';
  let justification = 'Classic and versatile choice';

  // Shirt color based on occasion and suit
  if (prefs.occasion === 'date' || prefs.occasion === 'cocktail') {
    if (suit.color === 'Navy') {
      color = prefs.season === 'summer' ? 'Light Pink' : 'Light Blue';
    }
  }

  if (prefs.formalityLevel === 'black-tie') {
    color = 'White';
    collar = 'Wing';
  } else if (prefs.formalityLevel === 'business-casual') {
    collar = 'Spread';
  }

  return { color, fabric, collar, cuffs, fit, justification };
};

const getNeckwearRecommendation = (prefs: UserPreferences, suit: any, shirt: any) => {
  let type = 'Bow Tie';
  let color = 'Burgundy';
  let pattern = 'Solid';
  let material = 'Silk';
  let justification = 'Elegant and formal choice';

  if (prefs.formalityLevel === 'black-tie') {
    return { type: 'Bow Tie', color: 'Black', pattern: 'Solid', material: 'Silk', justification: 'Traditional black tie attire' };
  }

  // Neckwear type based on formality
  if (prefs.formalityLevel === 'business-casual') {
    type = 'Notch Tie';
    justification = 'Business-appropriate choice';
  }

  // Neckwear color harmony
  if (suit.color === 'Navy') {
    color = shirt.color === 'Light Pink' ? 'Burgundy' : 'Gold';
    justification = `Complements the ${suit.color.toLowerCase()} suit and ${shirt.color.toLowerCase()} shirt`;
  }

  return { type, color, pattern, material, justification };
};

const getShoesRecommendation = (prefs: UserPreferences, suit: any) => {
  let type = 'Oxford';
  let color = 'Black';
  let material = 'Leather';
  let style = 'Oxford';
  let justification = 'Classic formal footwear';

  if (suit.color === 'Navy' && prefs.formalityLevel !== 'formal') {
    color = 'Brown';
    justification = 'Versatile choice that pairs well with navy';
  }

  if (prefs.formalityLevel === 'business-casual') {
    style = 'Derby';
  } else if (prefs.formalityLevel === 'black-tie') {
    style = 'Patent Leather Oxford';
  }

  return { type, color, material, style, justification };
};

const getAccessories = (prefs: UserPreferences): string[] => {
  const accessories = ['Leather Belt', 'Pocket Square'];

  if (prefs.formalityLevel === 'black-tie') {
    accessories.push('Cufflinks', 'Boutonniere');
  }

  if (prefs.occasion === 'wedding') {
    accessories.push('Boutonniere');
  }

  // Add cufflinks for formal occasions
  if (prefs.formalityLevel === 'formal' || prefs.formalityLevel === 'black-tie') {
    accessories.push('Cufflinks');
  }

  // Add watch for all occasions except casual
  if (prefs.formalityLevel !== 'business-casual') {
    accessories.push('Watch');
  }

  return [...new Set(accessories)]; // Remove duplicates
};

const generateJustification = (prefs: UserPreferences, suit: any, shirt: any, neckwear: any): string => {
  const occasion = prefs.occasion.charAt(0).toUpperCase() + prefs.occasion.slice(1);
  
  let justification = `This ${suit.color.toLowerCase()} ${suit.fit.toLowerCase()} suit is perfect for your ${occasion.toLowerCase()}. `;
  
  justification += `The ${suit.color.toLowerCase()} color provides ${getColorJustification(suit.color, prefs.skinTone)}, `;
  justification += `while the ${suit.fit.toLowerCase()} cut ${getFitJustification(suit.fit, prefs.bodyType)}. `;
  
  justification += `The ${shirt.color.toLowerCase()} shirt ${getShirtJustification(shirt.color, suit.color)}, `;
  justification += `and the ${neckwear.color.toLowerCase()} ${neckwear.type.toLowerCase()} ${getNeckwearJustification(neckwear.type, suit.color, shirt.color)}. `;
  
  justification += `This combination strikes the perfect balance between ${getFormalityDescription(prefs.formalityLevel)} and personal style.`;
  
  return justification;
};

const getColorJustification = (suitColor: string, skinTone: string): string => {
  const colorMap: { [key: string]: { [key: string]: string } } = {
    'Navy': {
      'fair': 'excellent contrast against your fair complexion',
      'medium': 'versatile elegance that complements your skin tone',
      'olive': 'rich depth that enhances your warm undertones',
      'dark': 'sophisticated contrast that highlights your features'
    },
    'Charcoal': {
      'fair': 'refined sophistication without overwhelming your complexion',
      'medium': 'timeless elegance that works perfectly with your skin tone',
      'olive': 'sleek modernity that complements your warm undertones',
      'dark': 'powerful presence that creates striking contrast'
    }
  };
  
  return colorMap[suitColor]?.[skinTone] || 'classic appeal';
};

const getFitJustification = (fit: string, bodyType: string): string => {
  const fitMap: { [key: string]: { [key: string]: string } } = {
    'Slim-fit': {
      'slim': 'enhances your lean frame perfectly',
      'athletic': 'showcases your physique without being too tight',
      'average': 'creates a modern, tailored silhouette',
      'broad': 'provides a more fitted look'
    },
    'Classic': {
      'broad': 'offers comfort while maintaining elegance',
      'average': 'provides timeless, flattering proportions',
      'athletic': 'balances your build beautifully',
      'slim': 'gives you a more substantial presence'
    }
  };
  
  return fitMap[fit]?.[bodyType] || 'complements your build';
};

const getShirtJustification = (shirtColor: string, suitColor: string): string => {
  if (shirtColor === 'White') return 'provides crisp, clean contrast';
  if (shirtColor === 'Light Blue') return 'adds subtle color while maintaining professionalism';
  if (shirtColor === 'Light Pink') return 'introduces warmth and modern sophistication';
  return 'complements the overall look';
};

const getNeckwearJustification = (type: string, suitColor: string, shirtColor: string): string => {
  if (type === 'Bow Tie') return 'adds rich warmth and completes the color harmony';
  if (type === 'Notch Tie') return 'introduces elegant brightness that ties the look together';
  return 'completes the ensemble perfectly';
};

const getFormalityDescription = (formality: string): string => {
  switch (formality) {
    case 'black-tie': return 'maximum formality';
    case 'formal': return 'professional formality';
    case 'semi-formal': return 'polished sophistication';
    case 'business-casual': return 'relaxed professionalism';
    default: return 'appropriate formality';
  }
};

const getSeasonalNotes = (prefs: UserPreferences): string => {
  const season = prefs.season;
  switch (season) {
    case 'summer':
      return `Perfect for summer with versatile fabric that transitions beautifully between temperatures.`;
    case 'winter':
      return `Ideal for winter with heavy wool that provides warmth while maintaining elegance.`;
    case 'spring':
      return `Great for spring with versatile fabric that transitions beautifully between temperatures.`;
    case 'fall':
      return `Excellent for fall with medium-weight fabric that adapts to changing temperatures.`;
    default:
      return `Versatile fabric choice suitable for any season.`;
  }
};

const getStyleNotes = (prefs: UserPreferences): string[] => {
  const notes = [];
  
  notes.push(`The cut enhances your ${prefs.bodyType} build`);
  notes.push(`The colors work beautifully with your ${prefs.skinTone} skin tone`);
  notes.push(`Perfect formality level for ${prefs.occasion} events`);
  
  return notes;
};
