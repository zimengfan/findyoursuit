import { searchImages } from '@/lib/imageSearch';
import { validateOutfitRecommendation } from '@/lib/validateRecommendation';
import { UserPreferences } from '@/pages/Index';

export interface OutfitRecommendationWithImages {
  suit: any;
  shirt: any;
  tie: any;
  shoes: any;
  accessories: string[];
  justification: string;
  imageQuery: string;
  seasonalNotes: string;
  styleNotes: string[];
  images: string[];
}

const QWEN_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

export async function getAIRecommendationWithImages(preferences: any): Promise<any> {
  const response = await fetch('http://localhost:5174/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preferences),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch recommendation');
  }
  return await response.json();
} 