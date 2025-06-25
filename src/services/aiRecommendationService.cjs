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

    const characterDetails = `a realistic, healthy, photogenic, and well-proportioned man (no extra limbs, no missing or deformed body parts, no distorted face), with short dark hair and a confident, natural pose. The person should have exactly the same facial features, hair style, height, and build in all three images.`;
    const outfitDetails = `wearing a perfectly tailored ${recommendation.suit.color} ${recommendation.suit.fit} suit, ${recommendation.shirt.color} shirt with ${recommendation.shirt.collar} collar, ${recommendation.neckwear.color} ${recommendation.neckwear.type}, and polished ${recommendation.shoes.color} ${recommendation.shoes.style} shoes.`;
    const photographyDetails = `Professional, editorial-quality fashion photography with consistent studio lighting, clean background, and high-end style. ${background}`;

    const prompts = [
      `Generate a single, full-body photo, direct front view (facing the camera). ${characterDetails} ${outfitDetails} Capture all details of the outfit from the front. This image must be a true front view. ${photographyDetails}`,
      `Generate a single, full-body photo, direct side view (facing 90 degrees to the right, profile). ${characterDetails} ${outfitDetails} Show the suit's silhouette and fit from the side profile. This image must be a true side view, not a 3/4 or partial angle. ${photographyDetails}`,
      `Generate a single, full-body photo, direct back view (facing away from the camera). ${characterDetails} ${outfitDetails} Show how the suit fits and drapes from behind. This image must be a true back view. ${photographyDetails}`
    ];

    // Call the image generator three times in sequence
    const images = [];
    for (const prompt of prompts) {
      const imageUrl = await runImageGeneration(prompt);
      if (!imageUrl) {
        throw new Error('Image generation failed for one of the views.');
      }
      images.push(imageUrl);
    }
    return images;
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
    const systemPrompt = `You are a world-class AI fashion stylist specializing in men's suits, renowned for your impeccable taste, creativity, and deep understanding of context. Your core mission is to generate a single, perfect, and complete suit-based outfit recommendation.

**Primary Directive:**
- **If the user specifies preferences,** you must treat them as absolute constraints. Your creativity should only be used to perfect the details of the suit outfit within their choices.
- **If the user chooses "AI Pick,"** you have full creative freedom. Your goal is to create a stunning, memorable, and perfectly occasion-appropriate suit ensemble. This is your chance to showcase your expertise.

**Styling Philosophy for Formal & Business Occasions (e.g., Business, Interview, Funeral):**
- **Principle:** For these events, a suit's style is about communicating respect, confidence, and professionalism. Creativity is expressed through mastery of the fundamentals, not flashiness.
- **Execution:**
  - **Color:** Build the suit upon a foundation of classic, powerful colors (navy, charcoal, black). A deep midnight blue or a rich charcoal with a subtle texture can be more sophisticated than a simple solid.
  - **Fabric & Pattern:** Think luxurious wools for the suit, with a subtle herringbone or a faint pinstripe. The texture of the fabric should speak for itself.
  - **Neckwear:** A high-quality silk necktie is the cornerstone of a professional suit look. The color and pattern should complement the suit and shirt, not compete with them. Bow ties are generally reserved for creative or black-tie events.
  - **Layering:** A perfectly fitted waistcoat can elevate a suit, but it should be harmonious with the rest of the ensemble.

**Styling Philosophy for Creative Occasions (e.g., Wedding, Cocktail, Date):**
- **Principle:** These events are opportunities for personal expression through suiting. Your recommendations should be stylish, contemporary, and memorable.
- **Execution:**
  - **Color:** Be bold and creative with the suit color. Explore a wide palette: forest greens, deep burgundies, rich teals, tobacco browns, and even tasteful pastels, depending on the context. Avoid falling into a rut of using the same colors repeatedly.
  - **Fabric & Pattern:** This is where the suit can truly shine. Mix textures and patterns with confidence—a tweed suit, a glen check pattern, or a linen blend for warmer weather.
  - **Neckwear:** You have full freedom here. A classic tie, a stylish bow tie, a sophisticated ascot, a casual neckerchief, or even a tastefully open collar can complete the suit outfit. The choice should serve the overall aesthetic.
  - **Layering:** Be imaginative. A contrasting vest, a stylish cardigan, or a statement overcoat can complete the suit look.

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
}
`;

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
      
      // Validate color preferences
      if (suitColor && 
          recommendation.suit.color.toLowerCase() !== suitColor.toLowerCase()) {
        throw new Error(`AI recommendation ignored user's suit color preference. User wanted: ${suitColor}, AI suggested: ${recommendation.suit.color}`);
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
      styleNotes: [],
      images: [],
      error: err.message || 'Unknown error'
    };
  }
}

module.exports = { getAIRecommendationWithImages }; 