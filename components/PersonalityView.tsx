
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { getChloeResponse } from '../geminiService';

const defaultTypingStatuses = [
  "Mepa is analyzing your energy...",
  "Mepa is sensing a disturbance...",
  "Mepa is charging her crystals...",
  "Mepa is protecting her peace...",
  "Mepa is reading your aura...",
  "Mepa is typing (unbothered)...",
  "Mepa is observing the chaos...",
  "Mepa is manifesting success...",
  "Mepa is blocking negative vibes...",
  "Mepa is sipping herbal tea...",
  "Mepa is not impressed..."
];

const keywordTypingStatuses: Record<string, string[]> = {
  fashion: ["Mepa is judging the fabric quality...", "Mepa is sensing polyester...", "Mepa demands haute couture..."],
  money: ["Mepa is visualizing abundance...", "Mepa is checking the empire's growth...", "Mepa smells success..."],
  gossip: ["Mepa is listening...", "Mepa requires receipts...", "Mepa is bored by petty drama..."],
  hustle: ["Mepa respects the drive...", "Mepa is building the brand...", "Mepa is leveling up..."],
  love: ["Mepa is doing a background check...", "Mepa says block him...", "Mepa knows his zodiac sign..."],
  men: ["Mepa smells a dusty...", "Mepa is preparing a reality check...", "Mepa has zero tolerance for disrespect..."]
};

const PersonalityView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      content: "I'm Mepa. I represent the divine feminine energy. Don't waste my time with low vibrations. What do you want? 🥀",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isUserActive, setIsUserActive] = useState(false);
  const [currentTypingStatus, setCurrentTypingStatus] = useState(defaultTypingStatuses[0]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const statusIntervalRef = useRef<number | null>(null);

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Status cycling logic while bot is typing
  useEffect(() => {
    if (isTyping) {
      statusIntervalRef.current = window.setInterval(() => {
        const nextStatus = defaultTypingStatuses[Math.floor(Math.random() * defaultTypingStatuses.length)];
        setCurrentTypingStatus(nextStatus);
      }, 2500);
    } else {
      if (statusIntervalRef.current) window.clearInterval(statusIntervalRef.current);
    }
    return () => {
      if (statusIntervalRef.current) window.clearInterval(statusIntervalRef.current);
    };
  }, [isTyping]);

  const getInitialStatus = (text: string) => {
    const lowercase = text.toLowerCase();
    for (const [key, statuses] of Object.entries(keywordTypingStatuses)) {
      if (lowercase.includes(key)) {
        return statuses[Math.floor(Math.random() * statuses.length)];
      }
    }
    return defaultTypingStatuses[Math.floor(Math.random() * defaultTypingStatuses.length)];
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);

    if (e.target.value.trim().length > 0) {
      setIsUserActive(true);
      if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = window.setTimeout(() => {
        setIsUserActive(false);
      }, 3000);
    } else {
      setIsUserActive(false);
    }
  };

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsUserActive(false);

    // Set first sassy status based on keywords
    setCurrentTypingStatus(getInitialStatus(textToSend));
    setIsTyping(true);

    try {
      const reply = await getChloeResponse(textToSend);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        content: reply,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestion = (text: string) => {
    handleSend(text);
  };

  return (
    <div className="max-w-3xl mx-auto h-[75vh] flex flex-col bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden">
      {/* Chat Header */}
      <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center space-x-5">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-2xl shadow-xl shadow-slate-200 overflow-hidden">
              <img src="https://picsum.photos/seed/mepa_dark/120" alt="Mepa" className="w-full h-full object-cover" />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white transition-all duration-500 ${isTyping || isUserActive ? 'bg-purple-500 animate-pulse scale-125' : 'bg-green-500'}`}></div>
          </div>
          <div>
            <h3 className="font-serif font-bold text-xl text-slate-900 italic">Mepa <span className="not-italic font-sans font-normal text-slate-400 text-xs ml-2">Dark Feminine Bot</span></h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.15em] mt-1 transition-all duration-300">
              {isTyping ? (
                <span className="text-purple-500 flex items-center">
                  <span className="inline-block w-1 h-1 bg-purple-500 rounded-full mr-1 animate-ping"></span>
                  {currentTypingStatus.replace('Mepa is ', '').replace('...', '')}
                </span>
              ) : isUserActive ? (
                <span className="text-slate-400 italic">Listening...</span>
              ) : (
                'Protecting the vibe'
              )}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isTyping ? 'bg-purple-500 scale-150 animate-bounce' : 'bg-slate-200'}`}></div>
          <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 delay-100 ${isTyping ? 'bg-purple-500 scale-150 animate-bounce' : 'bg-slate-200'}`}></div>
          <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 delay-200 ${isTyping ? 'bg-purple-500 scale-150 animate-bounce' : 'bg-slate-200'}`}></div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-10 py-10 space-y-8 bg-[#fdfdfd]" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[75%] px-6 py-4 rounded-[1.75rem] leading-relaxed shadow-sm ${msg.sender === 'user'
                ? 'bg-slate-900 text-white rounded-tr-none shadow-slate-200'
                : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none font-medium'
              }`}>
              <p className="text-sm">{msg.content}</p>
              <div className={`flex items-center justify-end mt-2 space-x-1 ${msg.sender === 'user' ? 'text-slate-400' : 'text-slate-300'}`}>
                <span className="text-[9px] uppercase font-black tracking-tighter">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.sender === 'bot' && <span className="text-[10px]">💅</span>}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="bg-white px-6 py-4 rounded-[1.75rem] border border-slate-100 rounded-tl-none flex items-center space-x-3 shadow-sm border-l-4 border-l-purple-400">
              <span className="flex space-x-1">
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></span>
              </span>
              <span className="text-[11px] font-bold text-slate-400 tracking-wide transition-all duration-500 uppercase italic">
                {currentTypingStatus}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-8 bg-white border-t border-slate-50 relative">
        <div className={`absolute -top-6 left-12 transition-all duration-500 text-[10px] font-black tracking-[0.2em] uppercase ${isUserActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <span className="text-purple-500 bg-white px-2">Mepa is listening... 🔮</span>
        </div>

        <div className="flex items-center space-x-4 bg-slate-50 border border-slate-100 rounded-3xl p-3 px-6 shadow-inner focus-within:ring-2 focus-within:ring-purple-100 focus-within:bg-white transition-all">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Speak your mind..."
            className="flex-1 bg-transparent py-2 focus:outline-none text-slate-800 placeholder:text-slate-400 font-medium"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-black disabled:opacity-30 disabled:grayscale transition-all shadow-xl shadow-slate-200 active:scale-90"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-6">
          <button onClick={() => handleSuggestion("Is this outfit high value?")} className="text-[9px] font-black text-slate-400 hover:text-purple-500 hover:border-purple-200 uppercase tracking-widest transition-all bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">Fashion 👗</button>
          <button onClick={() => handleSuggestion("How do I make more money?")} className="text-[9px] font-black text-slate-400 hover:text-green-500 hover:border-green-200 uppercase tracking-widest transition-all bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">Money 💸</button>
          <button onClick={() => handleSuggestion("He's acting suspicious.")} className="text-[9px] font-black text-slate-400 hover:text-red-500 hover:border-red-200 uppercase tracking-widest transition-all bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">Men 🥀</button>
          <button onClick={() => handleSuggestion("I need some motivation.")} className="text-[9px] font-black text-slate-400 hover:text-orange-500 hover:border-orange-200 uppercase tracking-widest transition-all bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">Hustle 📈</button>
          <button onClick={() => handleSuggestion("Should I block him?")} className="text-[9px] font-black text-slate-400 hover:text-slate-900 hover:border-slate-400 uppercase tracking-widest transition-all bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">Block Him 🔨</button>
        </div>
      </div>
    </div>
  );
};

export default PersonalityView;
