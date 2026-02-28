import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { SlideCanvas } from '@/components/carousel-v2/SlideCanvas';
import { Loader2, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CarouselSlide, CarouselTheme } from '@/components/carousel-v2/types';

const CarouselPreviewPublic = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [theme, setTheme] = useState<any>(null);
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchCarousel = async () => {
      if (!shareId) { setError('Link inválido'); setLoading(false); return; }

      const { data, error: err } = await supabase
        .from('saved_carousels')
        .select('slides, theme, topic')
        .eq('public_share_id', shareId)
        .single();

      if (err || !data) {
        setError('Carrossel não encontrado ou link expirado.');
      } else {
        setSlides(data.slides as unknown as CarouselSlide[]);
        setTheme(data.theme);
        setTopic(data.topic);
      }
      setLoading(false);
    };
    fetchCarousel();
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">😕 Ops!</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{topic} | Preview do Carrossel</title>
      </Helmet>
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold">{topic}</h1>
          <p className="text-sm text-muted-foreground">{slides.length} slides • Preview público</p>
        </div>

        <div className="relative" style={{ width: 400, height: 500 }}>
          {theme && slides[currentSlide] && (
            <SlideCanvas slide={slides[currentSlide]} theme={theme as CarouselTheme} />
          )}
          
          {/* Navigation */}
          <div className="absolute inset-y-0 left-0 flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-background/80 backdrop-blur -ml-5"
              onClick={() => setCurrentSlide(i => Math.max(0, i - 1))}
              disabled={currentSlide === 0}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-background/80 backdrop-blur -mr-5"
              onClick={() => setCurrentSlide(i => Math.min(slides.length - 1, i + 1))}
              disabled={currentSlide === slides.length - 1}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Dots */}
        <div className="flex gap-2 mt-4">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentSlide ? 'bg-primary scale-125' : 'bg-muted-foreground/30'}`}
              onClick={() => setCurrentSlide(i)}
            />
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-8">
          Criado com Método IA Real
        </p>
      </div>
    </>
  );
};

export default CarouselPreviewPublic;
