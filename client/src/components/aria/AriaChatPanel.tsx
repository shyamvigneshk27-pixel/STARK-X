import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles, CheckCircle, AlertTriangle } from 'lucide-react';
import { streamAriaResponse } from '../../api/ai';
import { toast } from '../ui/Toast';
import { cn } from '../../lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  tripId: string;
  budget: number;
  onItinerarySaved: () => void;
}

const QUICK_PROMPTS = [
  '10 days Japan $2500, street food & temples',
  'Weekend Paris, romantic & fine dining',
  '2 weeks Southeast Asia on a budget',
];

const TYPING_INDICATOR = (
  <div className="flex items-center gap-1 py-2 px-4">
    {[0, 1, 2].map(i => (
      <motion.span
        key={i}
        className="w-2 h-2 bg-primary-400 rounded-full"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
      />
    ))}
  </div>
);

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul class="list-disc list-inside space-y-1 my-2">$1</ul>')
    .replace(/\n/g, '<br />');
}

export default function AriaChatPanel({ tripId, budget, onItinerarySaved }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi! I'm **ARIA**, your AI travel co-pilot. 🌍\n\nTell me about your dream trip — where do you want to go, how long, and what's your vibe? I'll craft a personalized itinerary with activities, timings, and budget estimates!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [status, setStatus] = useState<'idle' | 'streaming' | 'error'>('idle');
  const [savedNotification, setSavedNotification] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, showTypingIndicator]);

  const sendMessage = async (text?: string) => {
    const messageText = (text ?? input).trim();
    if (!messageText || streaming) return;

    const userMessage: Message = { role: 'user', content: messageText };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setStreaming(true);
    setStatus('streaming');
    setShowTypingIndicator(true);

    let fullResponse = '';

    await streamAriaResponse({
      tripId,
      message: messageText,
      history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
      onChunk: (chunk) => {
        setShowTypingIndicator(false);
        fullResponse += chunk;
        // Strip <itinerary> block from displayed text
        const displayText = fullResponse.replace(/<itinerary>[\s\S]*?<\/itinerary>/g, '').trim();
        setStreamingContent(displayText);
      },
      onError: (errMsg) => {
        setStatus('error');
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: `⚠️ ${errMsg}` },
        ]);
        setShowTypingIndicator(false);
        setStreaming(false);
        setStreamingContent('');
      },
      onItinerarySaved: () => {
        setSavedNotification(true);
        toast.success('Itinerary saved! Check the Itinerary tab.');
        onItinerarySaved();
        setTimeout(() => setSavedNotification(false), 8000);
      },
      onDone: () => {
        const displayText = fullResponse.replace(/<itinerary>[\s\S]*?<\/itinerary>/g, '').trim();
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: displayText },
        ]);
        setStreamingContent('');
        setShowTypingIndicator(false);
        setStreaming(false);
        setStatus('idle');
      },
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-2xl glass">
      {/* Header */}
      <div className="aurora-bg p-4 flex items-center gap-3 flex-shrink-0">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shadow-glow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span
            className={cn(
              'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-black/20',
              status === 'idle' ? 'bg-green-400 animate-pulse' :
              status === 'streaming' ? 'bg-amber-400 animate-pulse' : 'bg-red-400'
            )}
          />
        </div>
        <div>
          <h2 className="font-bold text-white text-base leading-tight">ARIA</h2>
          <p className="text-white/70 text-xs">
            {status === 'streaming' ? 'Planning your trip…' : 'AI Travel Co-Pilot · Ready'}
          </p>
        </div>
        <div className="ml-auto text-white/60 text-xs">
          Budget: <span className="text-white font-semibold">${budget}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white rounded-br-sm shadow-glow'
                    : 'glass text-white/90 rounded-bl-sm border-l-2 border-primary-500/50'
                )}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
              />
            </motion.div>
          ))}

          {/* Streaming message */}
          {streamingContent && (
            <motion.div
              key="streaming"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div
                className="max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed glass text-white/90 border-l-2 border-primary-500/50"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(streamingContent) }}
              />
            </motion.div>
          )}

          {/* Typing indicator */}
          {showTypingIndicator && !streamingContent && (
            <motion.div
              key="typing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="glass rounded-2xl rounded-bl-sm border-l-2 border-primary-500/30">
                {TYPING_INDICATOR}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Itinerary saved notification */}
        <AnimatePresence>
          {savedNotification && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass rounded-2xl p-4 border border-green-500/30 flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div className="text-sm text-white">
                <span className="font-semibold">Itinerary saved!</span>{' '}
                <span className="text-white/60">Switch to the Itinerary tab to review your plan.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length === 1 && (
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              className="text-xs glass px-3 py-1.5 rounded-full text-white/70 hover:text-white hover:border-primary-500/50 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 flex-shrink-0 border-t border-white/5">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask ARIA to plan your trip..."
            disabled={streaming}
            className="input-glass text-sm flex-1"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || streaming}
            className="btn-primary px-4 py-3 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
