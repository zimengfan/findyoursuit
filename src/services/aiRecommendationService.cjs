const axios = require('axios');
require('dotenv').config();
const { validateOutfitRecommendation } = require('../lib/validateRecommendation.cjs');
const { spawn } = require('child_process');

function runImageGeneration(basePrompt) {
  return new Promise((resolve) => {
    try {
      console.log('[aiRecommendationService.cjs] runImageGeneration called with basePrompt:', basePrompt);
      const pythonProcess = spawn('python', ['src/services/imageGeneration.py', basePrompt]);
      
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
          // Parse all image URLs from the output
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
      console.error('Error in image generation child process:', err);
      resolve([]);
    }
  });
}

async function generateOutfitImage(recommendation, preferences) {
  try {
    console.log('[aiRecommendationService.cjs] generateOutfitImage called');
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

    const characterDetails = `one single ${skinToneDescription}, realistic, healthy, photogenic, and well-proportioned man, with short dark hair and a confident, natural pose.`;
    const layeringDetails = [];
    if (recommendation.layering.outerwear) layeringDetails.push(recommendation.layering.outerwear);
    if (recommendation.layering.vest) layeringDetails.push(recommendation.layering.vest);
    if (recommendation.layering.pocket_square) layeringDetails.push(`pocket square: ${recommendation.layering.pocket_square}`);
    const accessoriesDetails = Array.isArray(recommendation.accessories)
      ? recommendation.accessories.map(acc => {
          if (typeof acc === 'string') return acc;
          if (acc && typeof acc === 'object') {
            const parts = [];
            if (acc.item || acc.name) parts.push(acc.item || acc.name);
            if (acc.color) parts.push(acc.color);
            if (acc.material) parts.push(acc.material);
            if (acc.style) parts.push(acc.style);
            if (acc.description) parts.push(acc.description);
            return parts.join(', ');
          }
          return '';
        }).filter(Boolean)
      : [];
    const fullLayering = layeringDetails.length > 0 ? `Layering: ${layeringDetails.join(', ')}.` : '';
    const fullAccessories = accessoriesDetails.length > 0 ? `Accessories: ${accessoriesDetails.join('; ')}.` : '';
    const outfitDetails = `wearing a perfectly tailored ${recommendation.suit.color} ${recommendation.suit.fit} suit, ${recommendation.shirt.color} shirt with ${recommendation.shirt.collar} collar, ${recommendation.neckwear.color} ${recommendation.neckwear.type}, and polished ${recommendation.shoes.color} ${recommendation.shoes.style} shoes. ${fullLayering} ${fullAccessories}`;
    const photographyDetails = `Professional, editorial-quality fashion photography with consistent studio lighting, clean background, and high-end style. ${background}`;

    // Compose a base prompt for all three views
    const basePrompt = `${characterDetails} ${outfitDetails} ${photographyDetails}`;

    // Call the image generator ONCE, expecting two images
    const images = await runImageGeneration(basePrompt);
    if (!images || images.length !== 2) {
      throw new Error('Image generation failed for one or more views.');
    }
    return images;
  } catch (err) {
    console.error('Error in generating outfit images:', err);
    return [];
  }
}

function getSkinToneDescription(skinTone) {
  const skinToneMap = {
    'fair': 'person with fair/light skin tone, pale complexion, Caucasian features',
    'medium': 'person with medium skin tone, warm beige complexion, Mediterranean features',
    'olive': 'person with olive/tan skin tone, golden-brown complexion, Mediterranean/Middle Eastern features',
    'dark': 'person with dark/deep brown skin tone, rich ebony complexion, African features'
  };
  return skinToneMap[skinTone] || 'person with medium skin tone'; // default to medium if not specified
}

async function getAIRecommendationWithImages(preferences) {
  try {
    console.log('[aiRecommendationService.cjs] getAIRecommendationWithImages called with preferences:', preferences);
    // Handle custom color preference
    let suitColor = '';
    if (preferences.colorPreference) {
      if (preferences.colorPreference.startsWith('custom:')) {
        suitColor = preferences.colorPreference.replace('custom:', '').trim();
      } else if (preferences.colorPreference !== 'ai-pick') {
        suitColor = preferences.colorPreference;
      }
    }
    const systemPrompt = `You are an expert AI men's suit stylist. When users specify preferences, follow them exactly. For 'AI Pick' requests, design a bold, occasion-perfect outfit—formal events demand refined sophistication; creative events reward originality and fashion. Never default to clichés. Justify every choice implicitly through context.

- If the user enters a custom color, the SUIT must be that color. All other elements must be chosen to complement and harmonize with that suit color. This is a high-priority rule.
- Only include layering (vest, overcoat, pocket square, etc) if it is appropriate for the occasion or style. Do not add unnecessary layers. Always include all relevant accessories. The outfit should be described as a complete, styled ensemble, not just a suit and shirt.

**Your Response MUST be a single, valid JSON object with NO missing fields. Do not include any commentary, markdown, or code fences. The structure is as follows:**
{
  "suit": { "style": "", "color": "", "fabric": "", "pattern": "", "fit": "", "pieces": [], "justification": "" },
  "shirt": { "color": "", "fabric": "", "collar": "", "cuffs": "", "fit": "", "justification": "" },
  "neckwear": { "type": "", "color": "", "pattern": "", "material": "", "justification": "" },
  "shoes": { "type": "", "color": "", "material": "", "style": "", "justification": "" },
  "accessories": [],
  "layering": { "outerwear": "", "vest": "", "pocket_square": "" },
  "justification": "",
  "styleNotes": []
}`;

    const userPrompt = `Occasion: ${preferences.occasion}
Color Preferences: ${suitColor || 'Not specified'}
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
    console.log('[aiRecommendationService.cjs] Calling generateOutfitImage...');
    const generatedImages = await generateOutfitImage(recommendation, preferences);
    const images = generatedImages.length > 0 ? generatedImages : [];
    console.log('[aiRecommendationService.cjs] Images generated:', images);
    return { ...recommendation, images };
  } catch (err) {
    console.error('[aiRecommendationService.cjs] Error in recommendation generation:', err);
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
      styleNotes: [],
      images: [],
      error: err.message || 'Unknown error'
    };
  }
}

module.exports = { getAIRecommendationWithImages }; 