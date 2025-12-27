
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, User, Loader2, Sparkles, X, 
  Search, MapPin, Brain, Zap, Globe, ExternalLink
} from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { ChatMessage, GroundingChunk } from '../types';

export const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Toggles for different modes
  const [useThinking, setUseThinking] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [useMaps, setUseMaps] = useState(false);
  const [useLowLatency, setUseLowLatency] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const { text, groundingMetadata } = await geminiService.sendMessage(
        input, 
        useThinking, 
        useSearch, 
        useMaps, 
        useLowLatency
      );
      
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: text,
        groundingLinks: groundingMetadata as GroundingChunk[]
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: 'Sorry, I encountered an error. Please check your API key.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-2xl hover:bg-indigo-700 transition-all flex items-center gap-2 group z-50"
        >
          <Sparkles className="group-hover:rotate-12 transition-transform" />
          <span className="font-medium">Architect AI</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[450px] h-[650px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-4 z-50">
          {/* Header */}
          <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl">
                <Bot size={22} />
              </div>
              <div>
                <h3 className="font-bold text-sm">System Architect Pro</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Multi-Model Online</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-xl transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Mode Toggles */}
          <div className="flex items-center gap-2 p-2 bg-slate-50 border-b border-slate-100 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => { setUseThinking(!useThinking); if (!useThinking) { setUseSearch(false); setUseMaps(false); setUseLowLatency(false); } }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 whitespace-nowrap ${useThinking ? 'bg-purple-600 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
            >
              <Brain size={12} /> Thinking
            </button>
            <button 
              onClick={() => { setUseSearch(!useSearch); if (!useSearch) { setUseThinking(false); setUseLowLatency(false); } }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 whitespace-nowrap ${useSearch ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
            >
              <Search size={12} /> Search
            </button>
            <button 
              onClick={() => { setUseMaps(!useMaps); if (!useMaps) { setUseThinking(false); setUseLowLatency(false); } }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 whitespace-nowrap ${useMaps ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
            >
              <MapPin size={12} /> Maps
            </button>
            <button 
              onClick={() => { setUseLowLatency(!useLowLatency); if (!useLowLatency) { setUseThinking(false); setUseSearch(false); setUseMaps(false); } }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 whitespace-nowrap ${useLowLatency ? 'bg-amber-600 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
            >
              <Zap size={12} /> Flash Lite
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/50">
            {messages.length === 0 && (
              <div className="text-center py-16 px-8">
                <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Bot className="text-indigo-600" size={32} />
                </div>
                <h4 className="font-bold text-slate-800 mb-2">Architect AI Hub</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  I can analyze your Azure infrastructure, research latest cloud trends via Google Search, or find nearby data centers using Google Maps.
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] p-4 rounded-3xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-slate-900 text-white rounded-tr-none shadow-xl' 
                    : 'bg-white border border-slate-200 text-slate-700 shadow-sm rounded-tl-none'
                }`}>
                  <div className="flex items-center gap-2 mb-2 opacity-60">
                    {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                    <span className="text-[10px] uppercase font-bold tracking-wider">
                      {msg.role === 'user' ? 'Developer' : 'Architect'}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  
                  {msg.groundingLinks && msg.groundingLinks.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                        <Globe size={10} /> Sources & References
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {msg.groundingLinks.map((chunk, idx) => {
                          const link = chunk.web || chunk.maps;
                          if (!link) return null;
                          return (
                            <a 
                              key={idx} 
                              href={link.uri} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
                            >
                              {link.title.substring(0, 30)}... <ExternalLink size={10} />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-4 rounded-3xl rounded-tl-none flex items-center gap-3 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Processing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-5 border-t border-slate-100 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={
                  useSearch ? "Search recent Azure news..." :
                  useMaps ? "Find Azure data centers in Paris..." :
                  "Ask about infrastructure..."
                }
                className="flex-1 bg-slate-100 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="w-12 h-12 flex items-center justify-center bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-100"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
