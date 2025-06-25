import { searchImages } from '@/lib/imageSearch';
import { validateOutfitRecommendation } from '@/lib/validateRecommendation';
import { UserPreferences } from '@/pages/Recommendations';

export interface OutfitRecommendationWithImages {
  suit: any;
  shirt: any;
  neckwear: any;
  shoes: any;
  accessories: string[];
  justification: string;
  seasonalNotes: string;
  styleNotes: string[];
  images: string[];
}

const QWEN_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

export async function getAIRecommendationWithImages(preferences: any): Promise<any> {
  const API_BASE_URL = import.meta.env.PROD
    ? 'https://findyoursuit.onrender.com'
    : 'http://localhost:5174';
  const response = await fetch(`${API_BASE_URL}/api/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preferences),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch recommendation');
  }
  return await response.json();
}

function getSkinToneDescription(skinTone) {
  const skinToneMap = {
    'fair': 'person with fair/light skin tone, pale complexion',
    'medium': 'person with medium skin tone, warm beige complexion',
    'olive': 'person with olive/tan skin tone, Mediterranean complexion',
    'dark': 'person with dark/deep brown skin tone, rich ebony complexion'
  };
  return skinToneMap[skinTone] || 'person with medium skin tone'; // default to medium if not specified
} 