import React, { useState, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Share, Save, Sparkles, Shirt, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

interface RecommendationResultProps {
  recommendation: any;
  onReset: () => void;
  onReturnHome?: () => void;
}

const RecommendationResult: React.FC<RecommendationResultProps> = ({ 
  recommendation, 
  onReset,
  onReturnHome
}) => {
  if (!recommendation || typeof recommendation !== 'object') {
    return <div>Invalid recommendation data.</div>;
  }

  const suit = recommendation.suit || {};
  const shirt = recommendation.shirt || {};
  const neckwear = recommendation.neckwear || {};
  const shoes = recommendation.shoes || {};
  const layering = recommendation.layering || {};
  const accessories = Array.isArray(recommendation.accessories) ? recommendation.accessories : [];
  const styleNotes = Array.isArray(recommendation.styleNotes) ? recommendation.styleNotes : [];
  const images = Array.isArray(recommendation.images) ? recommendation.images : [];

  const [imageError, setImageError] = useState(false);
  
  // Mock image URL - in a real app, this would come from an image generation API
  const mockImageUrl = "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=600&fit=crop";

  // Embla carousel setup
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

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

  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (navigator.share && images.length > 0) {
      navigator.share({
        title: 'My SuitCraft AI Recommendation',
        text: recommendation.justification,
        url: images[0],
      });
    } else {
      setShowShareModal(true);
    }
  };

  const handleSave = async () => {
    if (images.length === 0) return;
    for (let i = 0; i < images.length; i++) {
      const url = images[i];
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `suitcraft-image-${i + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white py-8 relative">
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
            {onReturnHome && (
              <Button
                className="absolute top-4 right-4 bg-white/90 border border-slate-200 rounded-lg px-4 py-2 text-blue-700 font-semibold shadow hover:bg-blue-50 transition z-50"
                onClick={onReturnHome}
                aria-label="Return to Home"
              >
                ← Return to Home
              </Button>
            )}
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
                      {suit.color} {suit.style} {suit.fit} Suit
                    </h3>
                    <p className="text-slate-500">
                      {shirt.color} {shirt.collar} Shirt
                    </p>
                    <p className="text-slate-500">
                      {neckwear.color} {neckwear.type}
                    </p>
                    <p className="text-slate-500">
                      {shoes.color} {shoes.style}
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
                      {suit.color} {suit.style} {suit.fit}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-700">Fabric:</span>
                    <span className="text-slate-600">{suit.fabric}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-700">Shirt:</span>
                    <Badge variant="secondary" className="text-sm">
                      {shirt.color} {shirt.collar}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-700">Neckwear:</span>
                    <Badge variant="secondary" className="text-sm">
                      {neckwear.color} {neckwear.type}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-700">Shoes:</span>
                    <Badge variant="secondary" className="text-sm">
                      {shoes.color} {shoes.style}
                    </Badge>
                  </div>
                  
                  <Separator />
                  
                  {layering && (
                    <>
                      <div>
                        <span className="font-semibold text-slate-700 block mb-2">Layering:</span>
                        <div className="flex flex-wrap gap-2">
                          {layering.outerwear && (
                            <Badge variant="outline" className="text-xs">
                              {layering.outerwear}
                            </Badge>
                          )}
                          {layering.vest && (
                            <Badge variant="outline" className="text-xs">
                              {layering.vest}
                            </Badge>
                          )}
                          {layering.pocket_square && (
                            <Badge variant="outline" className="text-xs">
                              Pocket Square: {layering.pocket_square}
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
                      {accessories.map((accessory, index) => {
                        if (typeof accessory === 'string') {
                          return (
                            <Badge key={index} variant="outline" className="text-xs">
                              {accessory}
                            </Badge>
                          );
                        } else if (accessory && typeof accessory === 'object') {
                          // Build a readable string from object fields
                          const parts = [];
                          if (accessory.item || accessory.name) parts.push(accessory.item || accessory.name);
                          if (accessory.color) parts.push(accessory.color);
                          if (accessory.material) parts.push(accessory.material);
                          if (accessory.style) parts.push(accessory.style);
                          // Add any other fields as needed
                          return (
                            <Badge key={index} variant="outline" className="text-xs">
                              {parts.join(', ')}
                            </Badge>
                          );
                        } else {
                          return null;
                        }
                      })}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Styling Justification */}
              <Card className="p-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Why This Works</h2>
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-800 flex items-center"><Sparkles className="h-4 w-4 mr-2 text-yellow-500" /> Justification</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{recommendation.justification}</p>
                </div>
                
                <Separator />

                <div>
                  <h3 className="font-semibold text-slate-800">Style Notes</h3>
                  <ul className="list-disc list-inside text-slate-600 text-sm space-y-1 mt-2">
                    {styleNotes.map((note: string, idx: number) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl relative">
            <button className="absolute top-2 right-2 text-slate-500" onClick={() => setShowShareModal(false)}>&times;</button>
            <h3 className="text-lg font-bold mb-2">Share this look</h3>
            {images[0] && (
              <img src={images[0]} alt="Preview" className="w-full rounded mb-3" />
            )}
            <div className="flex flex-col gap-2 mb-2">
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(images[0] || window.location.href)}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Share on Facebook</a>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(images[0] || window.location.href)}&text=Check+out+my+SuitCraft+AI+look!`} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Share on Twitter</a>
              <a href={`https://wa.me/?text=${encodeURIComponent('Check out my SuitCraft AI look! ' + (images[0] || window.location.href))}`} target="_blank" rel="noopener noreferrer" className="text-green-600 underline">Share on WhatsApp</a>
            </div>
            <div className="flex items-center gap-2">
              <input type="text" value={images[0] || ''} readOnly className="flex-1 border px-2 py-1 rounded text-xs" />
              <Button size="sm" onClick={() => {navigator.clipboard.writeText(images[0] || ''); setCopied(true); setTimeout(()=>setCopied(false), 1500);}}>
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationResult;
