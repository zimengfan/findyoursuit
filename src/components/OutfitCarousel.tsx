import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface OutfitCarouselProps {
  images: string[];
}

export function OutfitCarousel({ images }: OutfitCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.map((imageUrl, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] min-w-0 relative"
            >
              <div className="aspect-[9/16] relative">
                <img
                  src={imageUrl}
                  alt={`Outfit view ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white/90"
        onClick={scrollPrev}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white/90"
        onClick={scrollNext}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <div className="flex justify-center gap-2 mt-4">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === selectedIndex ? 'bg-primary' : 'bg-gray-300'
            }`}
            onClick={() => emblaApi?.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
} 