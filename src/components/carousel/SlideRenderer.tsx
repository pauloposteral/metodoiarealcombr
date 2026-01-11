import { CarouselSlide, CarouselTheme } from './types';
import { 
  Lightbulb, Target, Rocket, TrendingUp, Zap, Star, Award, CheckCircle,
  ArrowRight, Brain, Cpu, MessageSquare, Users, BarChart, Sparkles, Shield,
  Clock, Settings, Layers, BookOpen, Compass, Flag, Heart, Puzzle
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

  // Decorative elements
  const renderDecorations = () => (
    <>
      {/* Corner accent */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 300,
          height: 300,
          background: `radial-gradient(circle at top right, ${theme.accentColor}20, transparent 70%)`,
        }}
      />
      {/* Bottom gradient */}
      <div 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 200,
          background: `linear-gradient(to top, ${theme.primaryColor}80, transparent)`,
        }}
      />
      {/* Subtle grid pattern */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(${theme.accentColor}08 1px, transparent 1px), linear-gradient(90deg, ${theme.accentColor}08 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
    </>
  );

  // Cover Slide
  if (slide.type === 'cover') {
    return (
      <div style={containerStyle}>
        {renderDecorations()}
        <div style={{
          position: 'relative',
          zIndex: 10,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '80px 60px',
          textAlign: 'center',
        }}>
          {/* Logo */}
          <img 
            src={logo} 
            alt="IA Real" 
            style={{ width: 120, marginBottom: 60, opacity: 0.9 }}
          />
          
          {/* Main Title */}
          <h1 style={{
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: 32,
            maxWidth: 900,
          }}>
            {slide.title}
          </h1>
          
          {/* Subtitle */}
          {slide.subtitle && (
            <p style={{
              fontSize: 32,
              fontWeight: 500,
              opacity: 0.85,
              maxWidth: 700,
              lineHeight: 1.4,
            }}>
              {slide.subtitle}
            </p>
          )}
          
          {/* Accent line */}
          <div style={{
            width: 100,
            height: 4,
            background: theme.accentColor,
            borderRadius: 2,
            marginTop: 48,
          }} />
          
          {/* Swipe indicator */}
          <div style={{
            position: 'absolute',
            bottom: 60,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            opacity: 0.6,
          }}>
            <span style={{ fontSize: 20 }}>Deslize para ver</span>
            <ArrowRight style={{ width: 24, height: 24 }} />
          </div>
        </div>
      </div>
    );
  }

  // Intro Slide
  if (slide.type === 'intro') {
    return (
      <div style={containerStyle}>
        {renderDecorations()}
        <div style={{
          position: 'relative',
          zIndex: 10,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px 70px',
        }}>
          <h2 style={{
            fontSize: 56,
            fontWeight: 700,
            lineHeight: 1.2,
            marginBottom: 40,
          }}>
            {slide.title}
          </h2>
          
          {slide.content && (
            <p style={{
              fontSize: 32,
              lineHeight: 1.6,
              opacity: 0.9,
              maxWidth: 850,
            }}>
              {slide.content}
            </p>
          )}
          
          <div style={{
            width: 80,
            height: 4,
            background: theme.accentColor,
            borderRadius: 2,
            marginTop: 48,
          }} />
        </div>
      </div>
    );
  }

  // CTA Slide
  if (slide.type === 'cta') {
    return (
      <div style={containerStyle}>
        {renderDecorations()}
        <div style={{
          position: 'relative',
          zIndex: 10,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '80px 60px',
          textAlign: 'center',
        }}>
          <Sparkles style={{ 
            width: 80, 
            height: 80, 
            color: theme.accentColor,
            marginBottom: 48,
          }} />
          
          <h2 style={{
            fontSize: 56,
            fontWeight: 700,
            lineHeight: 1.2,
            marginBottom: 32,
            maxWidth: 800,
          }}>
            {slide.title}
          </h2>
          
          {slide.content && (
            <p style={{
              fontSize: 28,
              lineHeight: 1.5,
              opacity: 0.85,
              maxWidth: 700,
              marginBottom: 48,
            }}>
              {slide.content}
            </p>
          )}
          
          {/* CTA Button */}
          <div style={{
            background: theme.accentColor,
            color: theme.primaryColor,
            padding: '24px 56px',
            borderRadius: 16,
            fontSize: 28,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}>
            Método IA Real
            <ArrowRight style={{ width: 28, height: 28 }} />
          </div>
          
          {/* Social actions */}
          <div style={{
            position: 'absolute',
            bottom: 80,
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            fontSize: 22,
            opacity: 0.7,
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
              bottom: 40,
              right: 60,
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
      {renderDecorations()}
      <div style={{
        position: 'relative',
        zIndex: 10,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px 70px',
      }}>
        {/* Step Number / Icon */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          marginBottom: 40,
        }}>
          {IconComponent && (
            <div style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: `${theme.accentColor}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <IconComponent style={{ 
                width: 44, 
                height: 44, 
                color: theme.accentColor 
              }} />
            </div>
          )}
          {slide.order !== undefined && (
            <span style={{
              fontSize: 24,
              fontWeight: 600,
              color: theme.accentColor,
              textTransform: 'uppercase',
              letterSpacing: 2,
            }}>
              {`Passo ${slide.order}`}
            </span>
          )}
        </div>
        
        {/* Title */}
        <h2 style={{
          fontSize: 52,
          fontWeight: 700,
          lineHeight: 1.2,
          marginBottom: 32,
          maxWidth: 900,
        }}>
          {slide.title}
        </h2>
        
        {/* Content */}
        {slide.content && (
          <p style={{
            fontSize: 30,
            lineHeight: 1.6,
            opacity: 0.9,
            maxWidth: 850,
          }}>
            {slide.content}
          </p>
        )}
        
        {/* Accent line */}
        <div style={{
          width: 60,
          height: 4,
          background: theme.accentColor,
          borderRadius: 2,
          marginTop: 48,
        }} />
        
        {/* Logo */}
        <img 
          src={logo} 
          alt="IA Real" 
          style={{ 
            position: 'absolute',
            bottom: 40,
            right: 60,
            width: 70, 
            opacity: 0.5 
          }}
        />
      </div>
    </div>
  );
};
