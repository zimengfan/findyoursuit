const axios = require('axios');
require('dotenv').config();
const { validateOutfitRecommendation } = require('../lib/validateRecommendation.cjs');
const { spawn } = require('child_process');

async function generateOutfitImage(recommendation, preferences) {
  return new Promise((resolve, reject) => {
    try {
      const skinToneDescription = getSkinToneDescription(preferences.skinTone);
      // Determine background based on occasion
      const occasionBackgrounds = {
        'wedding': 'elegant wedding venue background',
        'interview': 'modern office background',
        'business': 'corporate boardroom background',
        'date': 'romantic restaurant background',
        'gala': 'luxurious gala event background',
        'graduation': 'university ceremony background',
        'funeral': 'respectful, muted background',
        'cocktail': 'stylish cocktail party background',
        'default': 'studio background that matches the occasion'
      };
      let occasionKey = preferences.occasion;
      if (occasionKey && occasionKey.startsWith('custom:')) {
        occasionKey = 'default';
      }
      const background = occasionBackgrounds[occasionKey] || occasionBackgrounds['default'];
      const prompt = `Full body of a ${skinToneDescription} man wearing ${recommendation.suit.color} ${recommendation.suit.fit} suit, ${recommendation.shirt.color} shirt, ${recommendation.tie.color} tie, ${recommendation.shoes.color} shoes. Full body photo, ${background}`;

      // Spawn Python process
      const pythonProcess = spawn('python', ['src/services/imageGeneration.py', prompt]);
      
      let result = '';
      let error = '';

      pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
        console.log('Python output:', data.toString());
      });

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
        console.error('Python error:', data.toString());
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error('Python process error:', error);
          resolve([]);
        } else {
          // Parse multiple URLs from the output
          const urls = [];
          const lines = result.split('\n');
          for (const line of lines) {
            const match = line.match(/\d+\. (https?:\/\/[^\s]+)/);
            if (match && match[1]) {
              urls.push(match[1].trim());
            }
          }
          resolve(urls);
        }
      });

    } catch (err) {
      console.error('Error in image generation:', err);
      resolve([]);
    }
  });
}

function getSkinToneDescription(skinTone) {
  const skinToneMap = {
    'fair': 'fair-skinned',
    'medium': 'lightly tanned skin (not brown, more of a healthy beige)',
    'olive': 'light brown skin with warm undertones',
    'dark': 'dark-skinned'
  };
  return skinToneMap[skinTone] || 'medium-skinned'; // default to medium if not specified
}

async function getAIRecommendationWithImages(preferences) {
  try {
    // Handle custom color preference
    let suitColor = '';
    if (preferences.colorPreference) {
      if (preferences.colorPreference.startsWith('custom:')) {
        suitColor = preferences.colorPreference.replace('custom:', '').trim();
      } else if (preferences.colorPreference !== 'ai-pick') {
        suitColor = preferences.colorPreference;
      }
    }
    const systemPrompt = `You are a professional suit stylist AI. Your primary responsibility is to create HIGHLY DIVERSE and OCCASION-APPROPRIATE outfit recommendations that STRICTLY ADHERE to the user's preferences.

OCCASION-SPECIFIC GUIDELINES:
- Black Tie/Gala: Tuxedo or formal dinner jacket with appropriate accessories
- Wedding: Vary based on time (morning coat for day, tuxedo for evening)
- Business: Range from power suits to smart business attire
- Interview: Conservative but impressive business suits
- Cocktail: Modern, stylish suits with creative elements
- Casual Events: Consider blazer combinations, sport coats
- Seasonal Events: Adapt fabric weight and colors to weather

FORMALITY RULES:
1. Match formality EXACTLY to the occasion and user preference
2. For formal events: Consider tuxedos, morning coats, or three-piece suits
3. For business: Range from power suits to smart-casual blazers
4. For casual: Consider separates, sport coats, or blazer combinations

NECKWEAR DIVERSITY:
1. Formal: Bow ties, classic silk ties
2. Business: Neckties with varying widths and patterns
3. Creative: Ascots, cravats, or neckerchiefs
4. Casual: Optional tie, open collar, or casual alternatives

LAYERING AND COMPONENTS:
1. Consider multiple pieces: waistcoats, vests, overcoats
2. Suggest pocket squares, cufflinks, tie bars as appropriate
3. Include seasonal outerwear when relevant
4. Recommend appropriate fabric weights for the season

You must generate recommendations that are DIVERSE and CREATIVE, varying significantly based on:
- Occasion formality
- Time of day
- Season
- User's style preferences
- Cultural context of the event

Given the user's occasion and preferences, generate a JSON object with the following structure:
{
  suit: { 
    style: string, // e.g., "Three-piece suit", "Tuxedo", "Morning coat", "Sport coat with trousers"
    color,  // MUST match user's preferred color if specified
    fabric, 
    pattern, 
    fit,
    pieces: [string], // Array of suit components
    justification 
  },
  shirt: { 
    color,
    fabric, 
    collar, // Be specific about collar style
    cuffs: string, // e.g., "French cuffs", "Barrel cuffs"
    fit, 
    justification 
  },
  neckwear: { 
    type: string, // e.g., "Necktie", "Bow tie", "Ascot", "Cravat"
    color, 
    pattern, 
    material, 
    justification 
  },
  shoes: { 
    type, 
    color, 
    material,
    style: string, // e.g., "Oxford", "Derby", "Loafer"
    justification 
  },
  accessories: [string],
  layering: {
    outerwear: string, // Optional outerwear piece
    vest: string, // Optional vest/waistcoat
    pocket_square: string // Optional pocket square details
  },
  justification: string,
  seasonalNotes: string,
  styleNotes: [string]
}

Important rules:
1. If user specifies a suit color, use EXACTLY that color
2. NEVER default to standard colors (navy, charcoal) unless specifically requested
3. Each recommendation MUST be unique and specifically tailored
4. Consider the complete context (occasion, time, season, formality)
5. Provide detailed justification for style choices
6. Include specific fabric recommendations for the season
7. Suggest appropriate accessories for the occasion
8. Consider cultural and traditional aspects of formal events

Only output valid JSON. Do not include any explanation, markdown, or code fences.`;

    const userPrompt = `Occasion: ${preferences.occasion}
Color Preferences: ${suitColor || 'Not specified'}
Season: ${preferences.season || 'Not specified'}
Formality Level: ${preferences.formalityLevel || 'Not specified'}
Full Preferences: ${JSON.stringify(preferences)}`;
    
    const response = await axios.post('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      model: 'qwen-turbo',
      input: { prompt: `${systemPrompt}\n${userPrompt}` },
      parameters: { result_format: 'text' }
    }, {
      headers: { 'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}` }
    });

    const text = response.data.output.text;
    console.log('Raw LLM output:', text);
    const cleaned = text.replace(/^```json\s*|^```\s*|```$/gim, '').trim();
    let recommendation;

    try {
      recommendation = JSON.parse(cleaned);
      
      // Validate color preferences
      if (suitColor && 
          recommendation.suit.color.toLowerCase() !== suitColor.toLowerCase()) {
        throw new Error(`AI recommendation ignored user's suit color preference. User wanted: ${suitColor}, AI suggested: ${recommendation.suit.color}`);
      }

      // Ensure recommendations aren't defaulting to standard colors
      if (!suitColor && 
          (recommendation.suit.color.toLowerCase().includes('navy') || 
           recommendation.suit.color.toLowerCase().includes('charcoal'))) {
        throw new Error('AI defaulted to standard colors when not specifically requested');
      }

      // Validate occasion-appropriate formality
      if (!recommendation.suit.style || 
          !recommendation.neckwear || 
          !recommendation.neckwear.type) {
        throw new Error('Missing required style details for occasion-appropriate recommendation');
      }
    } catch (e) {
      throw new Error(e.message || 'Qwen output is not valid JSON');
    }

    // Convert accessories and styleNotes to arrays if needed
    if (recommendation && !Array.isArray(recommendation.accessories)) {
      if (typeof recommendation.accessories === 'object' && recommendation.accessories !== null) {
        recommendation.accessories = Object.values(recommendation.accessories).filter(v => typeof v === 'string');
      } else if (typeof recommendation.accessories === 'string') {
        recommendation.accessories = [recommendation.accessories];
      } else {
        recommendation.accessories = [];
      }
    }

    if (recommendation && !Array.isArray(recommendation.styleNotes)) {
      if (typeof recommendation.styleNotes === 'string') {
        recommendation.styleNotes = [recommendation.styleNotes];
      } else {
        recommendation.styleNotes = [];
      }
    }

    if (!validateOutfitRecommendation(recommendation)) {
      throw new Error('Recommendation JSON structure invalid');
    }

    // Generate AI images based on the recommendation
    const generatedImages = await generateOutfitImage(recommendation, preferences);
    const images = generatedImages.length > 0 ? generatedImages : [];

    return { ...recommendation, images };
  } catch (err) {
    console.error('Error in recommendation generation:', err);
    return {
      suit: {}, shirt: {}, tie: {}, shoes: {}, accessories: [],
      justification: 'Error generating recommendation',
      seasonalNotes: '', styleNotes: [], images: [],
      error: err.message || 'Unknown error'
    };
  }
}

module.exports = { getAIRecommendationWithImages }; 