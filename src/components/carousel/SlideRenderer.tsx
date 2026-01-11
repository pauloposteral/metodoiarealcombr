import { CarouselSlide, CarouselTheme } from './types';
import { 
  Lightbulb, Target, Rocket, TrendingUp, Zap, Star, Award, CheckCircle,
  ArrowRight, Brain, Cpu, MessageSquare, Users, BarChart, Sparkles, Shield,
  Clock, Settings, Layers, BookOpen, Compass, Flag, Heart, Puzzle, Loader2
} from 'lucide-react';
import logo from '@/assets/logo-iareal.png';

const iconComponents: Record<string, React.ComponentType<any>> = {
  Lightbulb, Target, Rocket, TrendingUp, Zap, Star, Award, CheckCircle,
  ArrowRight, Brain, Cpu, MessageSquare, Users, BarChart, Sparkles, Shield,
  Clock, Settings, Layers, BookOpen, Compass, Flag, Heart, Puzzle
};

interface SlideRendererProps {
  slide: CarouselSlide;
  theme: CarouselTheme;
}

export const SlideRenderer = ({ slide, theme }: SlideRendererProps) => {
  const IconComponent = slide.icon ? iconComponents[slide.icon] : null;

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    background: theme.backgroundGradient,
    color: theme.textColor,
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  };

  // Background image with overlay
  const renderBackgroundImage = () => {
    if (!slide.imageUrl) return null;
    
    return (
      <>
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${slide.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.4,
          }}
        />
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, ${theme.primaryColor}90 0%, ${theme.primaryColor}60 40%, ${theme.primaryColor}95 100%)`,
          }}
        />
      </>
    );
  };

  // Loading indicator for image generation
  const renderImageLoading = () => {
    if (!slide.isGeneratingImage) return null;
    
    return (
      <div 
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          background: 'rgba(0,0,0,0.5)',
          borderRadius: 8,
          fontSize: 14,
          zIndex: 100,
        }}
      >
        <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
        <span>Gerando imagem...</span>
      </div>
    );
  };

  // Decorative elements
  const renderDecorations = () => (
    <>
      {/* Corner accent */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 400,
          height: 400,
          background: `radial-gradient(circle at top right, ${theme.accentColor}15, transparent 70%)`,
        }}
      />
      {/* Bottom gradient */}
      <div 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 300,
          background: `linear-gradient(to top, ${theme.primaryColor}90, transparent)`,
        }}
      />
      {/* Subtle grid pattern */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(${theme.accentColor}05 1px, transparent 1px), linear-gradient(90deg, ${theme.accentColor}05 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />
    </>
  );

  // Cover Slide
  if (slide.type === 'cover') {
    return (
      <div style={containerStyle}>
        {renderBackgroundImage()}
        {renderDecorations()}
        {renderImageLoading()}
        <div style={{
          position: 'relative',
          zIndex: 10,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '100px 70px',
          textAlign: 'center',
        }}>
          {/* Logo */}
          <img 
            src={logo} 
            alt="IA Real" 
            style={{ width: 100, marginBottom: 60, opacity: 0.9 }}
          />
          
          {/* Main Title */}
          <h1 style={{
            fontSize: 80,
            fontWeight: 800,
            lineHeight: 1.05,
            marginBottom: 36,
            maxWidth: 900,
            textShadow: '0 4px 30px rgba(0,0,0,0.5)',
          }}>
            {slide.title}
          </h1>
          
          {/* Subtitle */}
          {slide.subtitle && (
            <p style={{
              fontSize: 34,
              fontWeight: 500,
              opacity: 0.9,
              maxWidth: 750,
              lineHeight: 1.4,
              textShadow: '0 2px 20px rgba(0,0,0,0.4)',
            }}>
              {slide.subtitle}
            </p>
          )}
          
          {/* Accent line */}
          <div style={{
            width: 100,
            height: 5,
            background: theme.accentColor,
            borderRadius: 3,
            marginTop: 50,
            boxShadow: `0 0 20px ${theme.accentColor}80`,
          }} />
          
          {/* Swipe indicator */}
          <div style={{
            position: 'absolute',
            bottom: 80,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            opacity: 0.7,
          }}>
            <span style={{ fontSize: 22, fontWeight: 500 }}>Deslize para ver</span>
            <ArrowRight style={{ width: 26, height: 26 }} />
          </div>
        </div>
      </div>
    );
  }

  // Intro Slide
  if (slide.type === 'intro') {
    return (
      <div style={containerStyle}>
        {renderBackgroundImage()}
        {renderDecorations()}
        {renderImageLoading()}
        <div style={{
          position: 'relative',
          zIndex: 10,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '100px 80px',
        }}>
          <h2 style={{
            fontSize: 60,
            fontWeight: 700,
            lineHeight: 1.15,
            marginBottom: 44,
            textShadow: '0 4px 30px rgba(0,0,0,0.5)',
          }}>
            {slide.title}
          </h2>
          
          {slide.content && (
            <p style={{
              fontSize: 34,
              lineHeight: 1.6,
              opacity: 0.95,
              maxWidth: 900,
              textShadow: '0 2px 20px rgba(0,0,0,0.4)',
            }}>
              {slide.content}
            </p>
          )}
          
          <div style={{
            width: 80,
            height: 5,
            background: theme.accentColor,
            borderRadius: 3,
            marginTop: 50,
            boxShadow: `0 0 15px ${theme.accentColor}60`,
          }} />
          
          {/* Logo */}
          <img 
            src={logo} 
            alt="IA Real" 
            style={{ 
              position: 'absolute',
              bottom: 50,
              right: 70,
              width: 70, 
              opacity: 0.6 
            }}
          />
        </div>
      </div>
    );
  }

  // Summary Slide
  if (slide.type === 'summary') {
    return (
      <div style={containerStyle}>
        {renderBackgroundImage()}
        {renderDecorations()}
        {renderImageLoading()}
        <div style={{
          position: 'relative',
          zIndex: 10,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '100px 80px',
          textAlign: 'center',
        }}>
          <Award style={{ 
            width: 80, 
            height: 80, 
            color: theme.accentColor,
            marginBottom: 40,
            filter: `drop-shadow(0 0 20px ${theme.accentColor}60)`,
          }} />
          
          <h2 style={{
            fontSize: 56,
            fontWeight: 700,
            lineHeight: 1.15,
            marginBottom: 36,
            maxWidth: 850,
            textShadow: '0 4px 30px rgba(0,0,0,0.5)',
          }}>
            {slide.title}
          </h2>
          
          {slide.content && (
            <p style={{
              fontSize: 32,
              lineHeight: 1.5,
              opacity: 0.9,
              maxWidth: 800,
              textShadow: '0 2px 20px rgba(0,0,0,0.4)',
            }}>
              {slide.content}
            </p>
          )}
          
          <div style={{
            width: 80,
            height: 5,
            background: theme.accentColor,
            borderRadius: 3,
            marginTop: 50,
            boxShadow: `0 0 15px ${theme.accentColor}60`,
          }} />
          
          {/* Logo */}
          <img 
            src={logo} 
            alt="IA Real" 
            style={{ 
              position: 'absolute',
              bottom: 50,
              right: 70,
              width: 70, 
              opacity: 0.6 
            }}
          />
        </div>
      </div>
    );
  }

  // CTA Slide
  if (slide.type === 'cta') {
    return (
      <div style={containerStyle}>
        {renderBackgroundImage()}
        {renderDecorations()}
        {renderImageLoading()}
        <div style={{
          position: 'relative',
          zIndex: 10,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '100px 70px',
          textAlign: 'center',
        }}>
          <Sparkles style={{ 
            width: 90, 
            height: 90, 
            color: theme.accentColor,
            marginBottom: 50,
            filter: `drop-shadow(0 0 25px ${theme.accentColor}70)`,
          }} />
          
          <h2 style={{
            fontSize: 58,
            fontWeight: 700,
            lineHeight: 1.15,
            marginBottom: 36,
            maxWidth: 850,
            textShadow: '0 4px 30px rgba(0,0,0,0.5)',
          }}>
            {slide.title}
          </h2>
          
          {slide.content && (
            <p style={{
              fontSize: 30,
              lineHeight: 1.5,
              opacity: 0.9,
              maxWidth: 750,
              marginBottom: 50,
              textShadow: '0 2px 20px rgba(0,0,0,0.4)',
            }}>
              {slide.content}
            </p>
          )}
          
          {/* CTA Button */}
          <div style={{
            background: `linear-gradient(135deg, ${theme.accentColor}, ${theme.accentColor}dd)`,
            color: theme.primaryColor,
            padding: '26px 60px',
            borderRadius: 18,
            fontSize: 30,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            boxShadow: `0 8px 30px ${theme.accentColor}50`,
          }}>
            Método IA Real
            <ArrowRight style={{ width: 30, height: 30 }} />
          </div>
          
          {/* Social actions */}
          <div style={{
            position: 'absolute',
            bottom: 100,
            display: 'flex',
            alignItems: 'center',
            gap: 32,
            fontSize: 24,
            opacity: 0.8,
          }}>
            <span>💾 Salve</span>
            <span>💬 Comente</span>
            <span>📤 Compartilhe</span>
          </div>
          
          {/* Logo */}
          <img 
            src={logo} 
            alt="IA Real" 
            style={{ 
              position: 'absolute',
              bottom: 50,
              right: 70,
              width: 80, 
              opacity: 0.7 
            }}
          />
        </div>
      </div>
    );
  }

  // Content Slide
  return (
    <div style={containerStyle}>
      {renderBackgroundImage()}
      {renderDecorations()}
      {renderImageLoading()}
      <div style={{
        position: 'relative',
        zIndex: 10,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '100px 80px',
      }}>
        {/* Step Number / Icon */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          marginBottom: 44,
        }}>
          {IconComponent && (
            <div style={{
              width: 90,
              height: 90,
              borderRadius: 22,
              background: `linear-gradient(135deg, ${theme.accentColor}30, ${theme.accentColor}15)`,
              border: `2px solid ${theme.accentColor}50`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 25px ${theme.accentColor}30`,
            }}>
              <IconComponent style={{ 
                width: 48, 
                height: 48, 
                color: theme.accentColor 
              }} />
            </div>
          )}
          {slide.order !== undefined && slide.order > 1 && (
            <span style={{
              fontSize: 26,
              fontWeight: 600,
              color: theme.accentColor,
              textTransform: 'uppercase',
              letterSpacing: 3,
              textShadow: `0 0 20px ${theme.accentColor}50`,
            }}>
              {`Passo ${slide.order - 1}`}
            </span>
          )}
        </div>
        
        {/* Title */}
        <h2 style={{
          fontSize: 56,
          fontWeight: 700,
          lineHeight: 1.15,
          marginBottom: 36,
          maxWidth: 900,
          textShadow: '0 4px 30px rgba(0,0,0,0.5)',
        }}>
          {slide.title}
        </h2>
        
        {/* Content */}
        {slide.content && (
          <p style={{
            fontSize: 32,
            lineHeight: 1.6,
            opacity: 0.95,
            maxWidth: 880,
            textShadow: '0 2px 20px rgba(0,0,0,0.4)',
          }}>
            {slide.content}
          </p>
        )}
        
        {/* Accent line */}
        <div style={{
          width: 70,
          height: 5,
          background: theme.accentColor,
          borderRadius: 3,
          marginTop: 50,
          boxShadow: `0 0 15px ${theme.accentColor}60`,
        }} />
        
        {/* Logo */}
        <img 
          src={logo} 
          alt="IA Real" 
          style={{ 
            position: 'absolute',
            bottom: 50,
            right: 70,
            width: 70, 
            opacity: 0.6 
          }}
        />
      </div>
    </div>
  );
};
