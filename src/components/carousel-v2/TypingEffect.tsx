import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TypingEffectProps {
  text: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
  className?: string;
  showCursor?: boolean;
  cursorChar?: string;
}

export const TypingEffect = ({
  text,
  speed = 50,
  delay = 0,
  onComplete,
  className = '',
  showCursor = true,
  cursorChar = '▋'
}: TypingEffectProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let charIndex = 0;

    const startTyping = () => {
      setIsTyping(true);
      setDisplayedText('');
      setIsComplete(false);

      const typeChar = () => {
        if (charIndex < text.length) {
          setDisplayedText(text.slice(0, charIndex + 1));
          charIndex++;
          timeout = setTimeout(typeChar, speed);
        } else {
          setIsTyping(false);
          setIsComplete(true);
          onComplete?.();
        }
      };

      timeout = setTimeout(typeChar, delay);
    };

    startTyping();

    return () => {
      clearTimeout(timeout);
    };
  }, [text, speed, delay, onComplete]);

  return (
    <span className={`inline ${className}`}>
      {displayedText}
      {showCursor && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="text-accent ml-0.5"
        >
          {cursorChar}
        </motion.span>
      )}
    </span>
  );
};

// Thinking dots animation
interface ThinkingDotsProps {
  className?: string;
}

export const ThinkingDots = ({ className = '' }: ThinkingDotsProps) => {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 bg-accent rounded-full"
          animate={{
            y: [0, -6, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </span>
  );
};

// Multi-line typing for multiple messages
interface MultiLineTypingProps {
  lines: string[];
  lineDelay?: number;
  speed?: number;
  className?: string;
}

export const MultiLineTyping = ({
  lines,
  lineDelay = 300,
  speed = 40,
  className = '',
}: MultiLineTypingProps) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [completedLines, setCompletedLines] = useState<string[]>([]);

  const handleLineComplete = useCallback(() => {
    setCompletedLines(prev => [...prev, lines[currentLineIndex]]);
    setTimeout(() => {
      setCurrentLineIndex(prev => prev + 1);
    }, lineDelay);
  }, [currentLineIndex, lines, lineDelay]);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Completed lines */}
      {completedLines.map((line, index) => (
        <motion.p
          key={`complete-${index}`}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          className="text-foreground"
        >
          {line}
        </motion.p>
      ))}

      {/* Currently typing line */}
      {currentLineIndex < lines.length && (
        <p className="text-foreground">
          <TypingEffect
            text={lines[currentLineIndex]}
            speed={speed}
            onComplete={handleLineComplete}
          />
        </p>
      )}
    </div>
  );
};