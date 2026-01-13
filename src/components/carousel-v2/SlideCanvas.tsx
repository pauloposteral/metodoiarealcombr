import { CarouselSlide, CarouselTheme } from './types';
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

export const SlideCanvas = ({ slide, theme }: SlideCanvasProps) => {
  const IconComponent = slide.icon ? iconComponents[slide.icon] : null;

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    background: theme.backgroundGradient,
    color: theme.textColor,
    fontFamily: theme.fontFamily,
    position: 'relative',
    overflow: 'hidden',
  };

  // Enhanced background with image
  const renderBackground = () => (
    <>
      {slide.imageUrl && (
        <>
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${slide.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.35,
              filter: 'blur(0px)',
            }}
          />
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(180deg, 
                ${theme.primaryColor}95 0%, 
                ${theme.primaryColor}70 30%, 
                ${theme.primaryColor}85 70%,
                ${theme.primaryColor}98 100%)`,
            }}
          />
        </>
      )}
      {/* Decorative elements */}
      <div 
        style={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 500,
          height: 500,
          background: `radial-gradient(circle, ${theme.accentColor}12, transparent 70%)`,
          borderRadius: '50%',
        }}
      />
      <div 
        style={{
          position: 'absolute',
          bottom: -150,
          left: -150,
          width: 400,
          height: 400,
          background: `radial-gradient(circle, ${theme.accentColor}08, transparent 70%)`,
          borderRadius: '50%',
        }}
      />
      {/* Subtle pattern */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(${theme.accentColor}03 1px, transparent 1px), 
                           linear-gradient(90deg, ${theme.accentColor}03 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
    </>
  );

  const renderLoadingIndicator = () => {
    if (!slide.isGeneratingImage) return null;
    return (
      <div style={{
        position: 'absolute',
        top: 24,
        right: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 18px',
        background: 'rgba(0,0,0,0.6)',
        borderRadius: 10,
        fontSize: 15,
        zIndex: 100,
        backdropFilter: 'blur(8px)',
      }}>
        <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} />
        <span>Gerando...</span>
      </div>
    );
  };

  const renderLogo = (position: 'corner' | 'center' = 'corner', size: number = 70) => (
    <img 
      src={logo} 
      alt="IA Real" 
      style={{ 
        position: position === 'corner' ? 'absolute' : 'relative',
        bottom: position === 'corner' ? 50 : undefined,
        right: position === 'corner' ? 70 : undefined,
        width: size, 
        opacity: 0.7,
        filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
      }}
    />
  );

  const renderAccentLine = (width: number = 80, marginTop: number = 40) => (
    <div style={{
      width,
      height: 5,
      background: `linear-gradient(90deg, ${theme.accentColor}, ${theme.accentColor}80)`,
      borderRadius: 3,
      marginTop,
      boxShadow: `0 0 20px ${theme.accentColor}50`,
    }} />
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
          padding: '80px 70px',
          textAlign: 'center',
        }}>
          {renderLogo('center', 90)}
          
          <h1 style={{
            fontSize: 78,
            fontWeight: 800,
            lineHeight: 1.08,
            marginTop: 50,
            marginBottom: 32,
            maxWidth: 920,
            textShadow: '0 6px 40px rgba(0,0,0,0.5)',
            letterSpacing: '-0.02em',
          }}>
            {slide.title}
          </h1>
          
          {slide.subtitle && (
            <p style={{
              fontSize: 32,
              fontWeight: 500,
              opacity: 0.92,
              maxWidth: 750,
              lineHeight: 1.45,
              textShadow: '0 3px 20px rgba(0,0,0,0.4)',
            }}>
              {slide.subtitle}
            </p>
          )}
          
          {renderAccentLine(100, 50)}
          
          <div style={{
            position: 'absolute',
            bottom: 70,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            opacity: 0.75,
          }}>
            <span style={{ fontSize: 20, fontWeight: 500, letterSpacing: '0.05em' }}>
              DESLIZE PARA VER
            </span>
            <ArrowRight style={{ width: 24, height: 24 }} />
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
          padding: '90px 80px',
        }}>
          <div style={{
            width: 6,
            height: 60,
            background: theme.accentColor,
            borderRadius: 3,
            marginBottom: 40,
            boxShadow: `0 0 15px ${theme.accentColor}60`,
          }} />
          
          <h2 style={{
            fontSize: 58,
            fontWeight: 700,
            lineHeight: 1.15,
            marginBottom: 40,
            maxWidth: 880,
            textShadow: '0 4px 30px rgba(0,0,0,0.5)',
          }}>
            {slide.title}
          </h2>
          
          {slide.content && (
            <p style={{
              fontSize: 32,
              lineHeight: 1.6,
              opacity: 0.95,
              maxWidth: 850,
              textShadow: '0 2px 20px rgba(0,0,0,0.4)',
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
          padding: '90px 80px',
          textAlign: 'center',
        }}>
          <div style={{
            width: 100,
            height: 100,
            borderRadius: 28,
            background: `linear-gradient(135deg, ${theme.accentColor}25, ${theme.accentColor}10)`,
            border: `3px solid ${theme.accentColor}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 45,
            boxShadow: `0 10px 40px ${theme.accentColor}25`,
          }}>
            <Award style={{ 
              width: 50, 
              height: 50, 
              color: theme.accentColor,
            }} />
          </div>
          
          <h2 style={{
            fontSize: 54,
            fontWeight: 700,
            lineHeight: 1.15,
            marginBottom: 35,
            maxWidth: 850,
            textShadow: '0 4px 30px rgba(0,0,0,0.5)',
          }}>
            {slide.title}
          </h2>
          
          {slide.content && (
            <p style={{
              fontSize: 30,
              lineHeight: 1.55,
              opacity: 0.92,
              maxWidth: 780,
              textShadow: '0 2px 20px rgba(0,0,0,0.4)',
            }}>
              {slide.content}
            </p>
          )}
          
          {renderAccentLine(80, 45)}
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
          padding: '80px 70px',
          textAlign: 'center',
        }}>
          <Sparkles style={{ 
            width: 85, 
            height: 85, 
            color: theme.accentColor,
            marginBottom: 45,
            filter: `drop-shadow(0 0 30px ${theme.accentColor}60)`,
          }} />
          
          <h2 style={{
            fontSize: 54,
            fontWeight: 700,
            lineHeight: 1.15,
            marginBottom: 32,
            maxWidth: 850,
            textShadow: '0 4px 30px rgba(0,0,0,0.5)',
          }}>
            {slide.title}
          </h2>
          
          {slide.content && (
            <p style={{
              fontSize: 28,
              lineHeight: 1.55,
              opacity: 0.9,
              maxWidth: 720,
              marginBottom: 45,
              textShadow: '0 2px 20px rgba(0,0,0,0.4)',
            }}>
              {slide.content}
            </p>
          )}
          
          <div style={{
            background: `linear-gradient(135deg, ${theme.accentColor}, ${theme.accentColor}dd)`,
            color: theme.primaryColor,
            padding: '24px 55px',
            borderRadius: 16,
            fontSize: 28,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            boxShadow: `0 10px 40px ${theme.accentColor}45`,
          }}>
            Método IA Real
            <ArrowRight style={{ width: 28, height: 28 }} />
          </div>
          
          <div style={{
            position: 'absolute',
            bottom: 90,
            display: 'flex',
            alignItems: 'center',
            gap: 28,
            fontSize: 22,
            opacity: 0.8,
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
        padding: '90px 80px',
      }}>
        {/* Step indicator with icon */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          marginBottom: 40,
        }}>
          {IconComponent && (
            <div style={{
              width: 85,
              height: 85,
              borderRadius: 22,
              background: `linear-gradient(135deg, ${theme.accentColor}28, ${theme.accentColor}12)`,
              border: `2px solid ${theme.accentColor}45`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 30px ${theme.accentColor}25`,
            }}>
              <IconComponent style={{ 
                width: 44, 
                height: 44, 
                color: theme.accentColor 
              }} />
            </div>
          )}
          {slide.order !== undefined && slide.order > 1 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
            }}>
              <span style={{
                fontSize: 16,
                fontWeight: 600,
                color: theme.accentColor,
                textTransform: 'uppercase',
                letterSpacing: 4,
                opacity: 0.9,
              }}>
                Passo
              </span>
              <span style={{
                fontSize: 48,
                fontWeight: 800,
                color: theme.accentColor,
                lineHeight: 1,
                textShadow: `0 0 25px ${theme.accentColor}40`,
              }}>
                {String(slide.order - 1).padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
        
        {/* Title */}
        <h2 style={{
          fontSize: 52,
          fontWeight: 700,
          lineHeight: 1.15,
          marginBottom: 35,
          maxWidth: 880,
          textShadow: '0 4px 30px rgba(0,0,0,0.5)',
        }}>
          {slide.title}
        </h2>
        
        {/* Content */}
        {slide.content && (
          <p style={{
            fontSize: 30,
            lineHeight: 1.6,
            opacity: 0.93,
            maxWidth: 820,
            textShadow: '0 2px 20px rgba(0,0,0,0.4)',
          }}>
            {slide.content}
          </p>
        )}

        {/* Bullets */}
        {slide.bullets && slide.bullets.length > 0 && (
          <div style={{ marginTop: 30 }}>
            {slide.bullets.map((bullet, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                marginBottom: 18,
              }}>
                <div style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: theme.accentColor,
                  marginTop: 12,
                  flexShrink: 0,
                  boxShadow: `0 0 10px ${theme.accentColor}60`,
                }} />
                <span style={{
                  fontSize: 26,
                  lineHeight: 1.5,
                  opacity: 0.9,
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
