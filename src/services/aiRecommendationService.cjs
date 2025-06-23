const axios = require('axios');
require('dotenv').config();
const { validateOutfitRecommendation } = require('../lib/validateRecommendation.cjs');
const { spawn } = require('child_process');

async function generateOutfitImage(recommendation, preferences) {
  return new Promise((resolve, reject) => {
    try {
      // Create a concise prompt within 500 characters
      const skinToneDescription = getSkinToneDescription(preferences.skinTone);
      const prompt = `Full body of a ${skinToneDescription} man wearing ${recommendation.suit.color} ${recommendation.suit.fit} suit, ${recommendation.shirt.color} shirt, ${recommendation.tie.color} tie, ${recommendation.shoes.color} shoes. Full body photo, studio lighting`;

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
    'medium': 'medium-skinned',
    'olive': 'olive-skinned',
    'dark': 'dark-skinned'
  };
  return skinToneMap[skinTone] || 'medium-skinned'; // default to medium if not specified
}

async function getAIRecommendationWithImages(preferences) {
  try {
    const systemPrompt = `You are a professional suit stylist AI. Your primary responsibility is to STRICTLY ADHERE to the user's color preferences when suggesting outfits. When a specific color is requested for any item, you MUST use that exact color in your recommendation.

Given the user's occasion and preferences, generate a JSON object with the following structure:
{
  suit: { 
    color, // MUST match user's preferred color if specified
    fabric, 
    pattern, 
    fit, 
    justification 
  },
  shirt: { 
    color, // Choose a color that complements the suit while respecting any user preferences
    fabric, 
    collar, 
    fit, 
    justification 
  },
  tie: { 
    color, // Choose a color that creates appropriate contrast with shirt and suit
    pattern, 
    material, 
    justification 
  },
  shoes: { 
    type, 
    color, // Should coordinate with the overall outfit
    material, 
    justification 
  },
  accessories: [string, ...], // array of accessory names only
  justification: string, // Include specific mention of how the colors work together
  seasonalNotes: string,
  styleNotes: [string, ...] // array of style notes, including color coordination tips
}

Important rules:
1. If the user specifies a suit color, you MUST use exactly that color - no substitutions
2. Never default to navy blue unless specifically requested
3. Ensure all color choices are explicitly justified in the response
4. Consider the occasion and season when suggesting colors
5. Maintain appropriate contrast between suit, shirt, and tie

Only output valid JSON. Do not include any explanation, markdown, or code fences.`;

    const userPrompt = `Occasion: ${preferences.occasion}\nColor Preferences: ${preferences.suitColor || 'Not specified'}\nFull Preferences: ${JSON.stringify(preferences)}`;
    
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
      if (preferences.suitColor && 
          recommendation.suit.color.toLowerCase() !== preferences.suitColor.toLowerCase()) {
        throw new Error(`AI recommendation ignored user's suit color preference. User wanted: ${preferences.suitColor}, AI suggested: ${recommendation.suit.color}`);
      }

      // Ensure navy blue isn't used as a default
      if (recommendation.suit.color.toLowerCase().includes('navy') && 
          (!preferences.suitColor || !preferences.suitColor.toLowerCase().includes('navy'))) {
        throw new Error('AI defaulted to navy blue when not specifically requested');
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