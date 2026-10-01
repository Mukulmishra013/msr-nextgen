'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, X, Send, MessageCircle, Loader2, ChevronDown } from 'lucide-react';
import { getWhatsAppUrl } from '@/lib/config';
import { trackEvent } from '@/lib/analytics';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome_1',
    role: 'assistant',
    content: 'Namaste! 🙏 Main Maya hu, MSR Next Gen ki AI Assistant. Hum aapke business ke liye high-converting Meta/Google Ads aur 24/7 AI WhatsApp Agents banate hain.\n\nAap kis business ke liye marketing ya automation dekh rahe hain?',
    time: 'Just now',
  },
];

const QUICK_PROMPTS = [
  'Pricing & Packages kya hain?',
  'Meta & Google Ads kaise help karenge?',
  'WhatsApp AI Bot kaise kaam karta hai?',
  'Free 15-min audit kaise book karein?',
];

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    trackEvent('ai_chat_message', { query: query.substring(0, 30) });

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            role: 'assistant',
            content: data.reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai_err_${Date.now()}`,
            role: 'assistant',
            content:
              'Aapka question receive hua! Hamare growth experts se direct WhatsApp par baat karne ke liye niche button dabayein.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_net_err_${Date.now()}`,
          role: 'assistant',
          content: 'Network connection slow hai. Aap direct WhatsApp par message bhej sakte hain: +91 95193 42440',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom-Left to avoid overlapping bottom-right WhatsApp button) */}
      <div className="fixed bottom-safe left-4 sm:left-6 z-40 pointer-events-auto">
        {!isOpen && (
          <button
            onClick={() => {
              setIsOpen(true);
              trackEvent('ai_chat_open', { source: 'floating_widget' });
            }}
            aria-label="Chat with AI Maya"
            className="group relative flex items-center gap-2.5 bg-slate-900 hover:bg-brand-900 text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-2xl hover:shadow-brand-900/40 active:scale-95 transition-all duration-300 border border-slate-700/80"
          >
            <div className="relative">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            </div>
            <div className="text-left hidden xs:block">
              <p className="text-xs sm:text-sm font-bold leading-none flex items-center gap-1.5">
                <span>Ask AI Maya</span>
                <Sparkles className="w-3 h-3 text-amber-300" />
              </p>
              <p className="text-[10px] text-slate-400 font-medium">Instant answers 24/7</p>
            </div>
          </button>
        )}
      </div>

      {/* Floating Chat Modal / Drawer */}
      {isOpen && (
        <div className="fixed bottom-4 left-4 sm:left-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] max-h-[85vh] h-[540px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-chat-in">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border border-slate-900 rounded-full" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                  Maya • MSR Next Gen AI
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </h3>
                <span className="text-[11px] text-emerald-300 font-medium">Online • Groq & Gemini Powered</span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              aria-label="Close Chat"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div ref={chatBodyRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-surface-50 text-slate-900 scroll-smooth">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-brand-600 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/90 shadow-2xs'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-slate-400 px-1">{msg.time}</span>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-200/90 w-fit text-xs text-slate-500 shadow-2xs">
                <Loader2 className="w-3.5 h-3.5 text-brand-600 animate-spin" />
                <span>Maya is thinking...</span>
              </div>
            )}
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto scrollbar-none">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="shrink-0 text-[11px] font-semibold text-slate-600 hover:text-brand-700 bg-surface-100 hover:bg-brand-50 px-2.5 py-1 rounded-full border border-slate-200/80 transition-colors disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything about ads, bots, pricing..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-surface-100 px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Footer Direct WhatsApp Link */}
          <div className="bg-slate-50 px-3 py-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span>Want to talk to Mukul directly?</span>
            <a
              href={getWhatsAppUrl('Hi Mukul, I was chatting with AI Maya on your website and want to discuss my business.')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:text-emerald-800 font-bold inline-flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
              <span>WhatsApp Us</span>
            </a>
          </div>

        </div>
      )}
    </>
  );
}
