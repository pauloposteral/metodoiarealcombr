import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MarkdownRenderer } from '@/components/course/MarkdownRenderer';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Sparkles, Send, Loader2, Bot, User, Trash2, 
  Lightbulb, MessageSquare, RotateCcw
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AISandboxProps {
  lessonId: string;
  lessonTitle: string;
  prompts?: string[];
}

const STARTER_PROMPTS = [
  "Avalie este prompt que criei e sugira melhorias",
  "Me dê um exemplo de prompt para redes sociais",
  "Como usar IA para criar conteúdo de marketing?",
  "Explique a técnica CRAFT para criação de prompts",
];

export const AISandbox = ({ lessonId, lessonTitle, prompts }: AISandboxProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const prompt = text || input.trim();
    if (!prompt || loading) return;

    const userMessage: Message = { role: 'user', content: prompt, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-sandbox', {
        body: { prompt, lessonId, context: lessonTitle },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response || 'Sem resposta',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      const errMsg = error?.message || 'Erro ao consultar IA';
      toast({ title: 'Erro', description: errMsg, variant: 'destructive' });
      // Remove the user message if failed
      setMessages(prev => prev.slice(0, -1));
      setInput(prompt);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  if (!expanded) {
    return (
      <div className="mb-8">
        <button
          onClick={() => setExpanded(true)}
          className="w-full bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 rounded-2xl p-6 text-left hover:border-accent/40 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
              <Bot className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                Sandbox IA
                <Sparkles className="w-4 h-4 text-accent" />
              </h3>
              <p className="text-sm text-muted-foreground">
                Pratique prompts e converse com a IA sobre o conteúdo desta aula
              </p>
            </div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden mb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-accent/5">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-accent" />
          <h3 className="font-display font-bold text-foreground">Sandbox IA</h3>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
            {messages.filter(m => m.role === 'user').length}/20 consultas
          </span>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground h-8">
              <Trash2 className="w-3.5 h-3.5 mr-1" />Limpar
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setExpanded(false)} className="text-muted-foreground h-8">
            Minimizar
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="max-h-[400px] overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-6">
            <Bot className="w-10 h-10 text-accent/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              Pratique seus prompts aqui! A IA vai avaliar e te ajudar a melhorar.
            </p>
            
            {/* Starter prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
              {(prompts && prompts.length > 0 
                ? prompts.slice(0, 4).map(p => p.length > 60 ? p.slice(0, 57) + '...' : p)
                : STARTER_PROMPTS
              ).map((starter, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(starter)}
                  className="text-left text-xs bg-secondary/50 hover:bg-secondary border border-border/30 rounded-lg p-3 transition-colors"
                >
                  <Lightbulb className="w-3 h-3 text-accent inline mr-1" />
                  <span className="text-foreground">{starter}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-3",
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-accent" />
              </div>
            )}
            <div
              className={cn(
                "rounded-xl px-4 py-3 max-w-[80%]",
                msg.role === 'user'
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary/50 border border-border/30"
              )}
            >
              {msg.role === 'assistant' ? (
                <div className="text-sm prose-sm">
                  <MarkdownRenderer content={msg.content} />
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-4 h-4 text-foreground" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-accent" />
            </div>
            <div className="bg-secondary/50 border border-border/30 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Pensando...
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border/50 p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite seu prompt ou pergunta..."
            rows={2}
            className="resize-none text-sm"
            disabled={loading}
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="bg-accent hover:bg-accent/90 h-auto px-4"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          Shift+Enter para nova linha · Enter para enviar
        </p>
      </div>
    </div>
  );
};
