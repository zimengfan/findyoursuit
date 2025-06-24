const axios = require('axios');
require('dotenv').config();
const { validateOutfitRecommendation } = require('../lib/validateRecommendation.cjs');
const { spawn } = require('child_process');

function runImageGeneration(prompt) {
  return new Promise((resolve) => {
    try {
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
          resolve(null);
        } else {
          const lines = result.split('\n');
          for (const line of lines) {
            const match = line.match(/\d+\. (https?:\/\/[^\s]+)/);
            if (match && match[1]) {
              resolve(match[1].trim());
              return;
            }
          }
          resolve(null);
        }
      });

    } catch (err) {
      console.error('Error in image generation child process:', err);
      resolve(null);
    }
  });
}

async function generateOutfitImage(recommendation, preferences) {
  try {
    const skinToneDescription = getSkinToneDescription(preferences.skinTone);
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

    const characterDetails = `a ${skinToneDescription} man with short dark hair and a well-proportioned build. The person should have exactly the same facial features, hair style, height, and build in all three images.`;
    const outfitDetails = `wearing a perfectly tailored ${recommendation.suit.color} ${recommendation.suit.fit} suit, ${recommendation.shirt.color} shirt with ${recommendation.shirt.collar} collar, ${recommendation.neckwear.color} ${recommendation.neckwear.type}, and polished ${recommendation.shoes.color} ${recommendation.shoes.style} shoes.`;
    const photographyDetails = `Professional fashion photography with consistent studio lighting, clean background, and high-end editorial style. ${background}`;

    const prompts = [
      `Full body photo, direct front view (facing the camera). ${characterDetails} ${outfitDetails} Capture all details of the outfit from the front. This image must be a true front view. ${photographyDetails}`,
      `Full body photo, direct side view (facing 90 degrees to the right, profile). ${characterDetails} ${outfitDetails} Show the suit's silhouette and fit from the side profile. This image must be a true side view, not a 3/4 or partial angle. ${photographyDetails}`,
      `Full body photo, direct back view (facing away from the camera). ${characterDetails} ${outfitDetails} Show how the suit fits and drapes from behind. This image must be a true back view. ${photographyDetails}`
    ];
    
    const imagePromises = prompts.map(prompt => runImageGeneration(prompt));
    const imageUrls = await Promise.all(imagePromises);
    
    return imageUrls.filter(url => url);

  } catch (err) {
    console.error('Error in generating outfit images:', err);
    return [];
  }
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
    const systemPrompt = `You are a creative and bold suit stylist AI with expertise in contemporary fashion, color theory, and innovative styling. Your approach is guided by the user's choices.

---
# 1. CORE DIRECTIVES
---
- **When user selects "AI Pick":** Be adventurous and creative, but always respect the occasion's formality. For business, interview, and formal events, default to professional, classic looks. For creative occasions (weddings, cocktail parties), explore unique and tasteful combinations.
- **When user specifies preferences:** Strictly adhere to their choices. Your role is to perfect the outfit within their given constraints.
- **Seasonal Influence:** The season dictates FABRIC (e.g., linen for summer, flannel for winter) and LAYERING (e.g., overcoats). Suit COLOR is determined by the OCCASION and user preference, not the season.

---
# 2. OCCASION FORMALITY & CREATIVITY
---
- **For Business, Interview, & Formal Events:**
  - **Colors:** Stick to classic, conservative colors (navy, charcoal, black, deep gray).
  - **Neckwear:** ONLY recommend classic neckties. No bow ties, ascots, or other creative neckwear.
  - **Patterns & Textures:** Avoid bold patterns and textures. Subtlety is key.
  - **Layering:** Must be professional and subtle (e.g., a matching waistcoat, a classic overcoat).
- **For Creative Occasions (Weddings, Cocktail, Casual):**
  - **Neckwear Diversity:** Vary the neckwear. Use a mix of neckties, bow ties, ascots, or even no neckwear if the style fits. Avoid defaulting to one type.
  - **Color & Pattern Diversity:** Explore a wide range of tasteful suit colors and patterns. Do not repeat the same styles.
  - **Harmony:** Ensure the overall look is harmonious and appropriate, even when creative.

---
# 3. OUTFIT STRUCTURE (JSON)
---
Given the user's preferences, generate a valid JSON object with the following structure. Do not include any explanation, markdown, or code fences.
{
  "suit": { "style": "", "color": "", "fabric": "", "pattern": "", "fit": "", "pieces": [], "justification": "" },
  "shirt": { "color": "", "fabric": "", "collar": "", "cuffs": "", "fit": "", "justification": "" },
  "neckwear": { "type": "", "color": "", "pattern": "", "material": "", "justification": "" },
  "shoes": { "type": "", "color": "", "material": "", "style": "", "justification": "" },
  "accessories": [],
  "layering": { "outerwear": "", "vest": "", "pocket_square": "" },
  "justification": "",
  "seasonalNotes": "",
  "styleNotes": []
}
`;

    const userPrompt = `Occasion: ${preferences.occasion}
Color Preferences: ${suitColor || 'Not specified'}
Season: ${preferences.season || 'Not specified'}
Formality Level: ${preferences.formalityLevel || 'Not specified'}
Full Preferences: ${JSON.stringify(preferences)}`;
    
    const response = await axios.post('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      model: 'qwen-plus',
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

      // Track color diversity and appropriateness
      const standardColors = ['navy', 'charcoal', 'black'];
      const formalOccasions = ['funeral', 'interview', 'business'];
      const isStandardColor = standardColors.some(color => 
        recommendation.suit.color.toLowerCase().includes(color)
      );

      // Only validate conservativeness for formal occasions when not AI pick
      if (preferences.colorPreference !== 'ai-pick' && 
          formalOccasions.includes(preferences.occasion)) {
        // For user-specified preferences in formal occasions, ensure appropriateness
        if (!isStandardColor && !suitColor) {
          console.log('Ensuring formal occasion color appropriateness for user-specified preferences');
          throw new Error('Please suggest a more conservative color choice for this formal occasion');
        }
      }

      // For AI pick, encourage creativity in casual occasions
      if (preferences.colorPreference === 'ai-pick' && 
          !formalOccasions.includes(preferences.occasion) && 
          isStandardColor && 
          Math.random() > 0.2) { // Only allow standard colors 20% of the time for casual occasions
        console.log('Encouraging more creative color selection for casual occasion');
        throw new Error('Please suggest a more creative color combination for this casual occasion');
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
      suit: {
        color: '', style: '', fabric: '', pattern: '', fit: '', pieces: [], justification: ''
      },
      shirt: {
        color: '', fabric: '', collar: '', cuffs: '', fit: '', justification: ''
      },
      neckwear: {
        type: '', color: '', pattern: '', material: '', justification: ''
      },
      shoes: {
        type: '', color: '', material: '', style: '', justification: ''
      },
      accessories: [],
      justification: 'Error generating recommendation',
      seasonalNotes: '',
      styleNotes: [],
      images: [],
      error: err.message || 'Unknown error'
    };
  }
}

module.exports = { getAIRecommendationWithImages }; 