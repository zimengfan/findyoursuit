import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export async function searchImages(query: string): Promise<string[]> {
  // Try SerpAPI
  if (process.env.SERPAPI_KEY) {
    try {
      const serp = await axios.get('https://serpapi.com/search', {
        params: { q: query, tbm: 'isch', api_key: process.env.SERPAPI_KEY, num: 3 }
      });
      const images = serp.data.images_results?.slice(0, 3).map((img: any) => img.original) || [];
      if (images.length) return images;
    } catch (e) { /* fallback */ }
  }
  // Try Unsplash
  if (process.env.UNSPLASH_ACCESS_KEY) {
    try {
      const unsplash = await axios.get('https://api.unsplash.com/search/photos', {
        params: { query, per_page: 3 },
        headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` }
      });
      const images = unsplash.data.results?.slice(0, 3).map((img: any) => img.urls.regular) || [];
      if (images.length) return images;
    } catch (e) { /* fallback */ }
  }
  // Try Bing
  if (process.env.BING_IMAGE_SEARCH_KEY) {
    try {
      const bing = await axios.get('https://api.bing.microsoft.com/v7.0/images/search', {
        params: { q: query, count: 3 },
        headers: { 'Ocp-Apim-Subscription-Key': process.env.BING_IMAGE_SEARCH_KEY }
      });
      const images = bing.data.value?.slice(0, 3).map((img: any) => img.contentUrl) || [];
      if (images.length) return images;
    } catch (e) { /* fallback */ }
  }
  // If all fail
  return [];
} 