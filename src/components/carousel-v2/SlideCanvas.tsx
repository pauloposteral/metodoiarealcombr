import { CarouselSlide, CarouselTheme, ImageFilter } from './types';
import { 
  Lightbulb, Target, Rocket, TrendingUp, Zap, Star, Award, CheckCircle,
  ArrowRight, Brain, Cpu, MessageSquare, Users, BarChart, Sparkles, Shield,
  Clock, Settings, Layers, BookOpen, Compass, Flag, Heart, Puzzle, Loader2,
  Eye, Lock, Unlock, DollarSign, Percent, Calendar, Bell, Gift
} from 'lucide-react';
import logo from '@/assets/logo-iareal.png';

const iconComponents: Record<string, React.ComponentType<any>> = {
  Lightbulb, Target, Rocket, TrendingUp, Zap, Star, Award, CheckCircle,
  ArrowRight, Brain, Cpu, MessageSquare, Users, BarChart, Sparkles, Shield,
  Clock, Settings, Layers, BookOpen, Compass, Flag, Heart, Puzzle,
  Eye, Lock, Unlock, DollarSign, Percent, Calendar, Bell, Gift
};

interface SlideCanvasProps {
  slide: CarouselSlide;
  theme: CarouselTheme;
}

// Font family mapping for each theme
const getFontStack = (fontFamily: string): string => {
  const fontMap: Record<string, string> = {
    "'Plus Jakarta Sans', sans-serif": "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    "'Playfair Display', serif": "'Playfair Display', Georgia, 'Times New Roman', serif",
    "'DM Sans', sans-serif": "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    "'Cormorant Garamond', serif": "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
    "'Inter', sans-serif": "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    "'Space Grotesk', sans-serif": "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    "'Nunito', sans-serif": "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    "'Quicksand', sans-serif": "'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    "'Bebas Neue', sans-serif": "'Bebas Neue', Impact, 'Arial Black', sans-serif",
    "'Orbitron', sans-serif": "'Orbitron', 'Courier New', monospace",
  };
  return fontMap[fontFamily] || fontFamily;
};

// Display font for titles (more impactful)
const getDisplayFont = (fontFamily: string): string => {
  if (fontFamily.includes('Playfair')) return "'Playfair Display', serif";
  if (fontFamily.includes('Cormorant')) return "'Cormorant Garamond', serif";
  if (fontFamily.includes('Bebas')) return "'Bebas Neue', sans-serif";
  if (fontFamily.includes('Orbitron')) return "'Orbitron', sans-serif";
  if (fontFamily.includes('Space Grotesk')) return "'Space Grotesk', sans-serif";
  return "'DM Sans', sans-serif";
};

// Image filter CSS mapping
const getImageFilterCSS = (filter: ImageFilter = 'none'): string => {
  const filters: Record<ImageFilter, string> = {
    none: 'saturate(1.1) contrast(1.05)',
    grayscale: 'grayscale(1) contrast(1.1)',
    sepia: 'sepia(0.8) saturate(1.2)',
    warm: 'saturate(1.4) sepia(0.2) brightness(1.05)',
    cool: 'saturate(0.9) hue-rotate(15deg) brightness(1.05)',
    vintage: 'sepia(0.4) saturate(1.3) contrast(1.1) brightness(0.95)',
    dramatic: 'contrast(1.4) saturate(1.3) brightness(0.9)',
  };
  return filters[filter] || filters.none;
};

export const SlideCanvas = ({ slide, theme }: SlideCanvasProps) => {
  const IconComponent = slide.icon ? iconComponents[slide.icon] : null;
  const fontStack = getFontStack(theme.fontFamily);
  const displayFont = getDisplayFont(theme.fontFamily);
  
  // Per-slide visual overrides
  const textColor = slide.customTextColor || theme.textColor;
  const accentColor = slide.customAccentColor || theme.accentColor;
  const imageOpacity = (slide.imageOpacity ?? 45) / 100;
  const imageFilter = getImageFilterCSS(slide.imageFilter);
  const titleSize = slide.titleFontSize || (slide.type === 'cover' ? 82 : 56);
  const contentSize = slide.contentFontSize || 32;

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    background: theme.backgroundGradient,
    color: textColor,
    fontFamily: fontStack,
    position: 'relative',
    overflow: 'hidden',
  };

  // Enhanced premium background with layered effects
  const renderBackground = () => (
    <>
      {/* Base image layer with advanced treatment */}
      {slide.imageUrl && (
        <>
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${slide.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: imageOpacity,
              filter: imageFilter,
            }}
          />
          {/* Premium gradient overlay */}
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(175deg, 
                ${theme.primaryColor}e8 0%, 
                ${theme.primaryColor}c0 35%, 
                ${theme.primaryColor}d5 65%,
                ${theme.primaryColor}f5 100%)`,
              opacity: 1 - imageOpacity * 0.5,
            }}
          />
          {/* Vignette effect */}
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(ellipse 120% 100% at 50% 50%, transparent 40%, ${theme.primaryColor}90 100%)`,
            }}
          />
        </>
      )}
      
      {/* Premium ambient glow - top right */}
      <div 
        style={{
          position: 'absolute',
          top: -200,
          right: -150,
          width: 600,
          height: 600,
          background: `radial-gradient(circle, ${accentColor}18, ${accentColor}08 40%, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(40px)',
        }}
      />
      
      {/* Secondary glow - bottom left */}
      <div 
        style={{
          position: 'absolute',
          bottom: -200,
          left: -200,
          width: 500,
          height: 500,
          background: `radial-gradient(circle, ${theme.secondaryColor}20, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(60px)',
        }}
      />
      
      {/* Accent line glow */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, transparent, ${accentColor}60, ${accentColor}, ${accentColor}60, transparent)`,
          opacity: 0.7,
        }}
      />
      
      {/* Premium noise texture overlay */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          opacity: 0.03,
          mixBlendMode: 'overlay',
        }}
      />
      
      {/* Subtle grid pattern */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(${accentColor}04 1px, transparent 1px), 
                           linear-gradient(90deg, ${accentColor}04 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
          opacity: 0.5,
        }}
      />
    </>
  );

  const renderLoadingIndicator = () => {
    if (!slide.isGeneratingImage) return null;
    return (
      <div style={{
        position: 'absolute',
        top: 28,
        right: 28,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 22px',
        background: 'rgba(0,0,0,0.7)',
        borderRadius: 14,
        fontSize: 16,
        fontWeight: 500,
        zIndex: 100,
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <Loader2 style={{ width: 20, height: 20, animation: 'spin 1s linear infinite' }} />
        <span>Gerando...</span>
      </div>
    );
  };

  const renderLogo = (position: 'corner' | 'center' = 'corner', size: number = 75) => (
    <img 
      src={logo} 
      alt="IA Real" 
      style={{ 
        position: position === 'corner' ? 'absolute' : 'relative',
        bottom: position === 'corner' ? 55 : undefined,
        right: position === 'corner' ? 65 : undefined,
        width: size, 
        opacity: 0.85,
        filter: 'drop-shadow(0 3px 12px rgba(0,0,0,0.4))',
      }}
    />
  );

  const renderAccentLine = (width: number = 90, marginTop: number = 45) => (
    <div style={{
      width,
      height: 5,
      background: `linear-gradient(90deg, ${accentColor}, ${accentColor}90)`,
      borderRadius: 3,
      marginTop,
      boxShadow: `0 0 30px ${accentColor}50, 0 0 60px ${accentColor}25`,
    }} />
  );

  // Premium accent badge
  const renderAccentBadge = (text: string) => (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 22px',
      background: `linear-gradient(135deg, ${accentColor}25, ${accentColor}15)`,
      border: `1.5px solid ${accentColor}50`,
      borderRadius: 50,
      fontSize: 16,
      fontWeight: 600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: accentColor,
      backdropFilter: 'blur(8px)',
    }}>
      {text}
    </div>
  );

  // ===== COVER SLIDE =====
  if (slide.type === 'cover') {
    return (
      <div style={containerStyle}>
        {renderBackground()}
        {renderLoadingIndicator()}
        <div style={{
          position: 'relative',
          zIndex: 10,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '85px 75px',
          textAlign: 'center',
        }}>
          {renderLogo('center', 95)}
          
          <h1 style={{
            fontFamily: displayFont,
            fontSize: titleSize,
            fontWeight: 800,
            lineHeight: 1.05,
            marginTop: 55,
            marginBottom: 35,
            maxWidth: 920,
            textShadow: '0 8px 50px rgba(0,0,0,0.6), 0 2px 10px rgba(0,0,0,0.3)',
            letterSpacing: '-0.025em',
          }}>
            {slide.title}
          </h1>
          
          {slide.subtitle && (
            <p style={{
              fontSize: 34,
              fontWeight: 500,
              opacity: 0.92,
              maxWidth: 760,
              lineHeight: 1.5,
              textShadow: '0 4px 25px rgba(0,0,0,0.45)',
              letterSpacing: '0.01em',
            }}>
              {slide.subtitle}
            </p>
          )}
          
          {renderAccentLine(110, 55)}
          
          <div style={{
            position: 'absolute',
            bottom: 75,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            opacity: 0.8,
          }}>
            <span style={{ 
              fontSize: 18, 
              fontWeight: 600, 
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}>
              Deslize para ver
            </span>
            <ArrowRight style={{ width: 22, height: 22 }} />
          </div>
        </div>
      </div>
    );
  }

  // ===== INTRO SLIDE =====
  if (slide.type === 'intro') {
    return (
      <div style={containerStyle}>
        {renderBackground()}
        {renderLoadingIndicator()}
        <div style={{
          position: 'relative',
          zIndex: 10,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '95px 85px',
        }}>
          {/* Premium accent bar */}
          <div style={{
            width: 7,
            height: 70,
            background: `linear-gradient(180deg, ${accentColor}, ${accentColor}70)`,
            borderRadius: 4,
            marginBottom: 45,
            boxShadow: `0 0 25px ${accentColor}50`,
          }} />
          
          <h2 style={{
            fontFamily: displayFont,
            fontSize: titleSize,
            fontWeight: 700,
            lineHeight: 1.12,
            marginBottom: 45,
            maxWidth: 880,
            textShadow: '0 5px 35px rgba(0,0,0,0.55)',
            letterSpacing: '-0.02em',
          }}>
            {slide.title}
          </h2>
          
          {slide.content && (
            <p style={{
              fontSize: contentSize,
              lineHeight: 1.65,
              opacity: 0.95,
              maxWidth: 840,
              textShadow: '0 3px 22px rgba(0,0,0,0.45)',
              fontWeight: 400,
            }}>
              {slide.content}
            </p>
          )}
          
          {renderLogo()}
        </div>
      </div>
    );
  }

  // ===== SUMMARY SLIDE =====
  if (slide.type === 'summary') {
    return (
      <div style={containerStyle}>
        {renderBackground()}
        {renderLoadingIndicator()}
        <div style={{
          position: 'relative',
          zIndex: 10,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '95px 85px',
          textAlign: 'center',
        }}>
          {/* Premium icon container */}
          <div style={{
            width: 110,
            height: 110,
            borderRadius: 32,
            background: `linear-gradient(145deg, ${accentColor}28, ${accentColor}12)`,
            border: `3px solid ${accentColor}45`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 50,
            boxShadow: `0 15px 50px ${accentColor}30, inset 0 1px 0 ${accentColor}40`,
          }}>
            <Award style={{ 
              width: 55, 
              height: 55, 
              color: accentColor,
              filter: `drop-shadow(0 2px 8px ${accentColor}60)`,
            }} />
          </div>
          
          <h2 style={{
            fontFamily: displayFont,
            fontSize: titleSize,
            fontWeight: 700,
            lineHeight: 1.12,
            marginBottom: 40,
            maxWidth: 860,
            textShadow: '0 5px 35px rgba(0,0,0,0.55)',
            letterSpacing: '-0.02em',
          }}>
            {slide.title}
          </h2>
          
          {slide.content && (
            <p style={{
              fontSize: contentSize,
              lineHeight: 1.6,
              opacity: 0.93,
              maxWidth: 780,
              textShadow: '0 3px 22px rgba(0,0,0,0.45)',
              fontWeight: 400,
            }}>
              {slide.content}
            </p>
          )}
          
          {renderAccentLine(90, 50)}
          {renderLogo()}
        </div>
      </div>
    );
  }

  // ===== CTA SLIDE =====
  if (slide.type === 'cta') {
    return (
      <div style={containerStyle}>
        {renderBackground()}
        {renderLoadingIndicator()}
        <div style={{
          position: 'relative',
          zIndex: 10,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '85px 75px',
          textAlign: 'center',
        }}>
          <Sparkles style={{ 
            width: 90, 
            height: 90, 
            color: accentColor,
            marginBottom: 50,
            filter: `drop-shadow(0 0 40px ${accentColor}60)`,
          }} />
          
          <h2 style={{
            fontFamily: displayFont,
            fontSize: titleSize,
            fontWeight: 700,
            lineHeight: 1.12,
            marginBottom: 36,
            maxWidth: 860,
            textShadow: '0 5px 35px rgba(0,0,0,0.55)',
            letterSpacing: '-0.02em',
          }}>
            {slide.title}
          </h2>
          
          {slide.content && (
            <p style={{
              fontSize: contentSize,
              lineHeight: 1.6,
              opacity: 0.9,
              maxWidth: 720,
              marginBottom: 50,
              textShadow: '0 3px 22px rgba(0,0,0,0.45)',
              fontWeight: 400,
            }}>
              {slide.content}
            </p>
          )}
          
          {/* Premium CTA button */}
          <div style={{
            background: `linear-gradient(140deg, ${accentColor}, ${accentColor}e0)`,
            color: theme.primaryColor,
            padding: '26px 60px',
            borderRadius: 18,
            fontSize: 28,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            boxShadow: `0 12px 50px ${accentColor}50, 0 4px 15px ${accentColor}30`,
            letterSpacing: '0.02em',
          }}>
            Método IA Real
            <ArrowRight style={{ width: 28, height: 28 }} />
          </div>
          
          {/* Social actions */}
          <div style={{
            position: 'absolute',
            bottom: 95,
            display: 'flex',
            alignItems: 'center',
            gap: 35,
            fontSize: 22,
            opacity: 0.85,
            fontWeight: 500,
          }}>
            <span>💾 Salve</span>
            <span>💬 Comente</span>
            <span>📤 Compartilhe</span>
          </div>
          
          {renderLogo()}
        </div>
      </div>
    );
  }

  // ===== CONTENT SLIDE =====
  return (
    <div style={containerStyle}>
      {renderBackground()}
      {renderLoadingIndicator()}
      <div style={{
        position: 'relative',
        zIndex: 10,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '95px 85px',
      }}>
        {/* Step indicator with icon */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 22,
          marginBottom: 45,
        }}>
          {IconComponent && (
            <div style={{
              width: 90,
              height: 90,
              borderRadius: 26,
              background: `linear-gradient(145deg, ${accentColor}30, ${accentColor}12)`,
              border: `2.5px solid ${accentColor}50`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 10px 40px ${accentColor}30, inset 0 1px 0 ${accentColor}30`,
            }}>
              <IconComponent style={{ 
                width: 48, 
                height: 48, 
                color: accentColor,
                filter: `drop-shadow(0 2px 6px ${accentColor}50)`,
              }} />
            </div>
          )}
          {slide.order !== undefined && slide.order > 1 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
            }}>
              <span style={{
                fontSize: 15,
                fontWeight: 700,
                color: accentColor,
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                opacity: 0.9,
              }}>
                Passo
              </span>
              <span style={{
                fontFamily: displayFont,
                fontSize: 52,
                fontWeight: 800,
                color: accentColor,
                lineHeight: 1,
                textShadow: `0 0 30px ${accentColor}45`,
              }}>
                {String(slide.order - 1).padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
        
        {/* Title */}
        <h2 style={{
          fontFamily: displayFont,
          fontSize: titleSize,
          fontWeight: 700,
          lineHeight: 1.12,
          marginBottom: 40,
          maxWidth: 880,
          textShadow: '0 5px 35px rgba(0,0,0,0.55)',
          letterSpacing: '-0.02em',
        }}>
          {slide.title}
        </h2>
        
        {/* Content */}
        {slide.content && (
          <p style={{
            fontSize: contentSize,
            lineHeight: 1.65,
            opacity: 0.93,
            maxWidth: 820,
            textShadow: '0 3px 22px rgba(0,0,0,0.45)',
            fontWeight: 400,
          }}>
            {slide.content}
          </p>
        )}

        {/* Bullets */}
        {slide.bullets && slide.bullets.length > 0 && (
          <div style={{ marginTop: 35 }}>
            {slide.bullets.map((bullet, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 18,
                marginBottom: 20,
              }}>
                <div style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${accentColor}, ${accentColor}80)`,
                  marginTop: 12,
                  flexShrink: 0,
                  boxShadow: `0 0 15px ${accentColor}60`,
                }} />
                <span style={{
                  fontSize: contentSize - 4,
                  lineHeight: 1.55,
                  opacity: 0.9,
                  fontWeight: 400,
                }}>
                  {bullet}
                </span>
              </div>
            ))}
          </div>
        )}
        
        {renderLogo()}
      </div>
    </div>
  );
};
