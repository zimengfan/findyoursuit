import React, { useState, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { OutfitRecommendation } from '@/services/recommendationService';
import { Share, Save, Sparkles, Shirt, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

interface RecommendationResultProps {
  recommendation: OutfitRecommendation;
  onReset: () => void;
}

const RecommendationResult: React.FC<RecommendationResultProps> = ({ 
  recommendation, 
  onReset 
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Mock image URL - in a real app, this would come from an image generation API
  const mockImageUrl = "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=600&fit=crop";

  // Embla carousel setup
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const images = recommendation.images && recommendation.images.length > 0 ? recommendation.images : [];

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);
  React.useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My SuitCraft AI Recommendation',
        text: recommendation.justification,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(
        `My SuitCraft AI Recommendation:\n\n${recommendation.justification}\n\nCheck out SuitCraft AI for your perfect suit!`
      );
      alert('Recommendation copied to clipboard!');
    }
  };

  const handleSave = () => {
    const dataStr = JSON.stringify(recommendation, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'my-suit-recommendation.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Sparkles className="h-8 w-8 mr-3 text-blue-300" />
              <h1 className="text-3xl font-bold">Your Perfect Look</h1>
            </div>
            <Button 
              variant="outline" 
              onClick={onReset}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              New Recommendation
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Visual Preview */}
            <Card className="p-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                <Shirt className="h-6 w-6 mr-2 text-blue-600" />
                Visual Preview
              </h2>
              
              <div className="relative bg-gradient-to-b from-slate-100 to-slate-200 rounded-lg p-8 mb-4 min-h-[400px] flex items-center justify-center">
                {images.length > 0 ? (
                  <div className="w-full">
                    <div className="overflow-hidden" ref={emblaRef}>
                      <div className="flex">
                        {images.map((url: string, idx: number) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`Outfit reference ${idx + 1}`}
                            className="rounded-lg shadow-lg mx-2"
                            style={{ width: 240, height: 'auto', flex: '0 0 240px', objectFit: 'cover' }}
                            onError={() => setImageError(true)}
                          />
                        ))}
                      </div>
                    </div>
                    {images.length > 1 && (
                      <div className="flex items-center justify-center mt-4 gap-4">
                        <Button onClick={scrollPrev} size="icon" variant="outline"><ChevronLeft /></Button>
                        {images.map((_, idx) => (
                          <button
                            key={idx}
                            className={`w-3 h-3 rounded-full mx-1 ${selectedIndex === idx ? 'bg-blue-600' : 'bg-slate-300'}`}
                            style={{ border: 'none' }}
                            onClick={() => emblaApi && emblaApi.scrollTo(idx)}
                            aria-label={`Go to slide ${idx + 1}`}
                          />
                        ))}
                        <Button onClick={scrollNext} size="icon" variant="outline"><ChevronRight /></Button>
                      </div>
                    )}
                  </div>
                ) : !imageError ? (
                  <img
                    src={mockImageUrl}
                    alt="Suit recommendation preview"
                    className="max-w-full max-h-[350px] object-cover rounded-lg shadow-lg"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="text-center">
                    <Shirt className="h-24 w-24 mx-auto text-slate-400 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600 mb-2">
                      {recommendation.suit.color} {recommendation.suit.style} {recommendation.suit.fit} Suit
                    </h3>
                    <p className="text-slate-500">
                      {recommendation.shirt.color} {recommendation.shirt.collar} Shirt
                    </p>
                    <p className="text-slate-500">
                      {recommendation.neckwear.color} {recommendation.neckwear.type}
                    </p>
                    <p className="text-slate-500">
                      {recommendation.shoes.color} {recommendation.shoes.style}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleShare} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button onClick={handleSave} variant="outline" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </Card>

            {/* Recommendation Details */}
            <div className="space-y-6">
              {/* Outfit Breakdown */}
              <Card className="p-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Outfit Details</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-700">Suit:</span>
                    <Badge variant="secondary" className="text-sm">
                      {(recommendation.suit?.color || '') + ' ' + (recommendation.suit?.style || '') + ' ' + (recommendation.suit?.fit || '')}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-700">Fabric:</span>
                    <span className="text-slate-600">{recommendation.suit?.fabric || ''}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-700">Shirt:</span>
                    <Badge variant="secondary" className="text-sm">
                      {(recommendation.shirt?.color || '') + ' ' + (recommendation.shirt?.collar || '')}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-700">Neckwear:</span>
                    <Badge variant="secondary" className="text-sm">
                      {(recommendation.neckwear?.color || '') + ' ' + (recommendation.neckwear?.type || '')}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-700">Shoes:</span>
                    <Badge variant="secondary" className="text-sm">
                      {(recommendation.shoes?.color || '') + ' ' + (recommendation.shoes?.style || '')}
                    </Badge>
                  </div>
                  
                  <Separator />
                  
                  {recommendation.layering && (
                    <>
                      <div>
                        <span className="font-semibold text-slate-700 block mb-2">Layering:</span>
                        <div className="flex flex-wrap gap-2">
                          {recommendation.layering.outerwear && (
                            <Badge variant="outline" className="text-xs">
                              {recommendation.layering.outerwear}
                            </Badge>
                          )}
                          {recommendation.layering.vest && (
                            <Badge variant="outline" className="text-xs">
                              {recommendation.layering.vest}
                            </Badge>
                          )}
                          {recommendation.layering.pocket_square && (
                            <Badge variant="outline" className="text-xs">
                              Pocket Square: {recommendation.layering.pocket_square}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Separator />
                    </>
                  )}
                  
                  <div>
                    <span className="font-semibold text-slate-700 block mb-2">Accessories:</span>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(recommendation.accessories) ? recommendation.accessories : []).map((accessory, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {accessory}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Styling Justification */}
              <Card className="p-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Why This Works</h2>
                <p className="text-slate-700 leading-relaxed mb-4">
                  {recommendation.justification}
                </p>
                
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2">Seasonal Note</h3>
                  <p className="text-blue-700 text-sm">
                    {recommendation.seasonalNotes}
                  </p>
                </div>
              </Card>

              {/* Style Notes */}
              <Card className="p-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Style Highlights</h2>
                <ul className="space-y-2">
                  {(Array.isArray(recommendation.styleNotes) ? recommendation.styleNotes : []).map((note, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span className="text-slate-700">{note}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationResult;
