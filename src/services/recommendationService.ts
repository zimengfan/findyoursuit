
import { UserPreferences } from '@/pages/Index';

export interface OutfitRecommendation {
  suit: {
    color: string;
    style: string;
    fabric: string;
    fit: string;
  };
  shirt: {
    color: string;
    style: string;
    pattern: string;
  };
  tie: {
    color: string;
    pattern: string;
    material: string;
  };
  shoes: {
    style: string;
    color: string;
  };
  accessories: string[];
  justification: string;
  imageQuery: string;
  seasonalNotes: string;
  styleNotes: string[];
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
  const tieRecommendation = getTieRecommendation(prefs, suitRecommendation, shirtRecommendation);
  const shoesRecommendation = getShoesRecommendation(prefs, suitRecommendation);
  const accessories = getAccessories(prefs);

  // Generate justification
  const justification = generateJustification(prefs, suitRecommendation, shirtRecommendation, tieRecommendation);
  
  // Create image query for visual representation
  const imageQuery = `${suitRecommendation.color} ${suitRecommendation.fit} suit with ${shirtRecommendation.color} ${shirtRecommendation.style} shirt and ${tieRecommendation.color} ${tieRecommendation.pattern} tie, ${shoesRecommendation.color} ${shoesRecommendation.style}, professional photography, full-body shot, elegant styling`;

  // Seasonal notes
  const seasonalNotes = getSeasonalNotes(prefs.season, suitRecommendation);

  // Style notes
  const styleNotes = getStyleNotes(prefs, suitRecommendation);

  return {
    suit: suitRecommendation,
    shirt: shirtRecommendation,
    tie: tieRecommendation,
    shoes: shoesRecommendation,
    accessories,
    justification,
    imageQuery,
    seasonalNotes,
    styleNotes
  };
};

const getSuitRecommendation = (prefs: UserPreferences) => {
  let color = 'Navy';
  let style = 'Two-piece';
  let fabric = 'Wool';
  let fit = 'Classic';

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

  return { color, style, fabric, fit };
};

const getShirtRecommendation = (prefs: UserPreferences, suit: any) => {
  let color = 'White';
  let style = 'Dress';
  let pattern = 'Solid';

  // Shirt color based on occasion and suit
  if (prefs.occasion === 'date' || prefs.occasion === 'cocktail') {
    if (suit.color === 'Navy') {
      color = prefs.season === 'summer' ? 'Light Pink' : 'Light Blue';
    }
  }

  if (prefs.formalityLevel === 'black-tie') {
    color = 'White';
    style = 'Wing Collar';
  } else if (prefs.formalityLevel === 'business-casual') {
    pattern = 'Subtle Pattern';
  }

  return { color, style, pattern };
};

const getTieRecommendation = (prefs: UserPreferences, suit: any, shirt: any) => {
  let color = 'Burgundy';
  let pattern = 'Solid';
  let material = 'Silk';

  if (prefs.formalityLevel === 'black-tie') {
    return { color: 'Black', pattern: 'Bow Tie', material: 'Silk' };
  }

  // Tie color harmony
  if (suit.color === 'Navy') {
    color = shirt.color === 'Light Pink' ? 'Burgundy' : 'Gold';
  } else if (suit.color === 'Charcoal') {
    color = 'Silver';
  }

  // Pattern based on formality
  if (prefs.formalityLevel === 'business-casual') {
    pattern = 'Subtle Pattern';
  }

  return { color, pattern, material };
};

const getShoesRecommendation = (prefs: UserPreferences, suit: any) => {
  let style = 'Oxford';
  let color = 'Black';

  if (suit.color === 'Navy' && prefs.formalityLevel !== 'formal') {
    color = 'Brown';
  }

  if (prefs.formalityLevel === 'business-casual') {
    style = 'Derby';
  } else if (prefs.formalityLevel === 'black-tie') {
    style = 'Patent Leather Oxford';
  }

  return { style, color };
};

const getAccessories = (prefs: UserPreferences): string[] => {
  const accessories = ['Leather Belt', 'Pocket Square'];

  if (prefs.formalityLevel === 'black-tie') {
    accessories.push('Cufflinks', 'Boutonniere');
  }

  if (prefs.occasion === 'wedding') {
    accessories.push('Boutonniere');
  }

  if (prefs.budget === 'luxury' || prefs.budget === 'premium') {
    accessories.push('Watch', 'Cufflinks');
  }

  return accessories;
};

const generateJustification = (prefs: UserPreferences, suit: any, shirt: any, tie: any): string => {
  const occasion = prefs.occasion.charAt(0).toUpperCase() + prefs.occasion.slice(1);
  
  let justification = `This ${suit.color.toLowerCase()} ${suit.fit.toLowerCase()} suit is perfect for your ${occasion.toLowerCase()}. `;
  
  justification += `The ${suit.color.toLowerCase()} color provides ${getColorJustification(suit.color, prefs.skinTone)}, `;
  justification += `while the ${suit.fit.toLowerCase()} cut ${getFitJustification(suit.fit, prefs.bodyType)}. `;
  
  justification += `The ${shirt.color.toLowerCase()} shirt ${getShirtJustification(shirt.color, suit.color)}, `;
  justification += `and the ${tie.color.toLowerCase()} tie ${getTieJustification(tie.color, suit.color, shirt.color)}. `;
  
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

const getTieJustification = (tieColor: string, suitColor: string, shirtColor: string): string => {
  if (tieColor === 'Burgundy') return 'adds rich warmth and completes the color harmony';
  if (tieColor === 'Gold') return 'introduces elegant brightness that ties the look together';
  if (tieColor === 'Silver') return 'provides sophisticated metallic accent';
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

const getSeasonalNotes = (season: string, suit: any): string => {
  switch (season) {
    case 'summer':
      return `Perfect for ${season} with ${suit.fabric.toLowerCase()} that breathes well and keeps you comfortable in warm weather.`;
    case 'winter':
      return `Ideal for ${season} with ${suit.fabric.toLowerCase()} that provides warmth while maintaining elegance.`;
    case 'spring':
      return `Great for ${season} with versatile fabric that transitions beautifully between temperatures.`;
    case 'fall':
      return `Excellent for ${season} with rich tones that complement the changing leaves and cooler weather.`;
    default:
      return 'Suitable for year-round wear with classic styling.';
  }
};

const getStyleNotes = (prefs: UserPreferences, suit: any): string[] => {
  const notes = [];
  
  notes.push(`${suit.fit} cut enhances your ${prefs.bodyType} build`);
  notes.push(`${suit.color} works beautifully with ${prefs.skinTone} skin tones`);
  notes.push(`Perfect formality level for ${prefs.occasion} events`);
  
  if (prefs.budget === 'luxury') {
    notes.push('Premium fabrics and construction for lasting quality');
  }
  
  return notes;
};
