
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, MessageType } from './types';
import { generateTextResponse, generateImage } from './services/geminiService';
import { 
  Send, 
  Image as ImageIcon, 
  Code as CodeIcon, 
  Cpu, 
  User, 
  Sparkles, 
  Terminal,
  RefreshCw,
  Download,
  MessageSquare,
  Zap,
  Globe,
  Layers
} from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: 'नमस्ते! मैं योगेश एआई हूँ। आपकी वेबसाइट में आपका स्वागत है। मैं कोडिंग, सवालों के जवाब और बेमिसाल 3D इमेज बनाने में माहिर हूँ। चलिए कुछ शानदार करते हैं!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<'chat' | 'image'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      if (mode === 'image') {
        const imageUrl = await generateImage(currentInput);
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'image',
          content: `मैंने आपके लिए यह 3D विजुअल तैयार किया है: "${currentInput}"`,
          imageUrl,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        const history = messages
          .filter(m => m.type !== 'image')
          .map(m => ({
            role: m.type === 'user' ? 'user' as const : 'model' as const,
            parts: [{ text: m.content }]
          }));
        
        const response = await generateTextResponse(currentInput, history);
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: response || 'माफ करना, मैं अभी जवाब नहीं दे सका।',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'क्षमस्व! सिस्टम ओवरलोड है। कृपया पुनः प्रयास करें।',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-5xl mx-auto px-4 py-8">
      {/* 3D Animated Header Section */}
      <header className="mb-12 flex flex-col items-center text-center">
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute inset-0 bg-sky-500 blur-2xl opacity-20 animate-pulse"></div>
          <div className="w-full h-full glass rounded-3xl flex items-center justify-center animate-logo border-2 border-sky-400/30">
            <Cpu size={48} className="text-sky-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
          </div>
        </div>
        <h1 className="text-3xl md:text-6xl font-black orbitron glow-text text-white tracking-tighter mb-4 leading-tight">
          स्वागत है आपका <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-purple-600">योगेश की वेबसाइट में</span>
        </h1>
        <div className="flex items-center gap-3 px-6 py-2 glass rounded-full text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-sky-400 border border-sky-500/20">
          <Globe size={14} className="animate-spin [animation-duration:10s]" />
          <span>Next-Gen 3D AI Assistant</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </header>

      {/* Main Chat/Image Portal */}
      <main className="flex-1 flex flex-col glass rounded-[3rem] overflow-hidden border border-white/5 relative bg-slate-950/40">
        {/* Toggle Controls */}
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 z-10">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center border-sky-500/30">
                <Layers size={24} className="text-sky-400" />
             </div>
             <div>
                <h2 className="text-xl font-black orbitron tracking-widest">YOGESH OS</h2>
                <p className="text-[10px] font-bold text-sky-500/60 uppercase tracking-widest">Version 4.0 Alpha</p>
             </div>
          </div>
          
          <div className="flex bg-black/60 p-1.5 rounded-2xl border border-white/10 backdrop-blur-3xl">
            <button 
              onClick={() => setMode('chat')}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl transition-all font-black text-xs uppercase tracking-widest ${mode === 'chat' ? 'bg-sky-600 text-white shadow-2xl shadow-sky-900/40' : 'text-gray-500 hover:text-white'}`}
            >
              <MessageSquare size={16} />
              <span>सवाल पूछें</span>
            </button>
            <button 
              onClick={() => setMode('image')}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl transition-all font-black text-xs uppercase tracking-widest ${mode === 'image' ? 'bg-purple-600 text-white shadow-2xl shadow-purple-900/40' : 'text-gray-500 hover:text-white'}`}
            >
              <ImageIcon size={16} />
              <span>3D इमेज</span>
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 min-h-[500px] relative">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.03),transparent)]"></div>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} message-in`}>
              <div className={`flex gap-4 max-w-[95%] md:max-w-[80%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg border-2 ${msg.type === 'user' ? 'bg-slate-800 border-sky-400/20' : 'bg-sky-600 border-white/20'}`}>
                  {msg.type === 'user' ? <User size={20} className="text-sky-400" /> : <Sparkles size={20} className="text-white" />}
                </div>
                <div className={`p-5 rounded-3xl shadow-2xl border transition-all hover:scale-[1.01] ${
                  msg.type === 'user' 
                    ? 'bg-sky-600/90 text-white rounded-tr-none border-sky-500' 
                    : 'bg-white/5 text-gray-100 rounded-tl-none border-white/10 backdrop-blur-2xl'
                }`}>
                  {msg.type === 'image' && msg.imageUrl ? (
                    <div className="space-y-4">
                      <p className="text-sm font-black italic text-sky-300 uppercase tracking-widest">{msg.content}</p>
                      <div className="relative group overflow-hidden rounded-2xl border-4 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        <img 
                          src={msg.imageUrl} 
                          alt="AI Crafted 3D" 
                          className="w-full max-w-lg object-cover transform transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-end p-4">
                          <a 
                            href={msg.imageUrl} 
                            download={`yogesh-ai-${Date.now()}.png`}
                            className="w-full bg-white text-black font-black py-3 rounded-xl text-center text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-sky-400 transition-colors"
                          >
                            Download 3D Asset
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-base md:text-lg leading-relaxed whitespace-pre-wrap font-medium">
                      {msg.content.includes('```') ? (
                        <div className="mt-4 font-mono text-[13px] bg-black/80 p-6 rounded-2xl border border-sky-500/30 overflow-x-auto text-sky-400 shadow-inner">
                           <div className="flex items-center gap-2 mb-4 text-sky-500/50 uppercase text-[10px] font-black border-b border-sky-500/10 pb-3">
                              <CodeIcon size={14} /> Neural Code Generated
                           </div>
                           {msg.content}
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  )}
                  <div className={`text-[10px] mt-4 font-black uppercase tracking-[0.2em] opacity-30 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start message-in">
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-2xl bg-sky-600 flex items-center justify-center animate-pulse border border-sky-400/30">
                  <Terminal size={20} className="text-white" />
                </div>
                <div className="bg-white/5 p-4 rounded-3xl rounded-tl-none border border-white/10 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce"></div>
                  </div>
                  <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">Yogesh Processing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Action Input Area */}
        <div className="p-8 bg-gradient-to-t from-black/60 to-transparent border-t border-white/10 z-10">
          <div className="flex flex-col md:flex-row items-stretch gap-4 max-w-4xl mx-auto">
            <div className="flex-1 relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={mode === 'image' ? "3D में क्या देखना चाहेंगे? (उदा: Future City at Night)" : "योगेश से कोई भी सवाल पूछें..."}
                className="w-full bg-black/80 border-2 border-white/10 rounded-3xl py-5 px-8 focus:outline-none focus:border-sky-500 transition-all text-white pr-20 shadow-2xl group-hover:border-white/20 text-lg placeholder-gray-600"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-sky-500 transition-colors">
                <Zap size={24} />
              </div>
            </div>
            
            <button
              onClick={handleSend}
              disabled={isTyping || !input.trim()}
              className={`flex-shrink-0 px-12 py-5 rounded-3xl font-black uppercase tracking-[0.2em] transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95 ${
                mode === 'image' 
                ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/40 text-white' 
                : 'bg-sky-600 hover:bg-sky-500 shadow-sky-900/40 text-white'
              } disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              {isTyping ? (
                <RefreshCw size={28} className="animate-spin" />
              ) : (
                <>
                  <span className="text-sm">{mode === 'image' ? 'बनाओ' : 'पूछें'}</span>
                  <Send size={24} />
                </>
              )}
            </button>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-8 opacity-40">
            <div className="flex items-center gap-2">
              <CodeIcon size={14} className="text-sky-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Code Engine v2</span>
            </div>
            <div className="flex items-center gap-2">
              <ImageIcon size={14} className="text-purple-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">3D Vision GPU</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-yellow-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Real-time Latency</span>
            </div>
          </div>
        </div>
      </main>

      {/* Massive Branding Footer */}
      <footer className="py-20 flex flex-col items-center">
        <div className="relative group cursor-pointer">
          <div className="absolute -inset-10 bg-sky-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
          <div className="relative flex flex-col items-center">
             <span className="text-[10px] md:text-xs font-black tracking-[0.8em] text-sky-500/40 uppercase mb-4">Masterminds behind the UI</span>
             <h2 className="text-5xl md:text-8xl font-black orbitron text-white tracking-tighter transition-all">
                FOUNDER <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-sky-400 to-blue-800 drop-shadow-2xl">YOGESH</span>
             </h2>
             <div className="h-1.5 w-64 bg-gradient-to-r from-transparent via-sky-500 to-transparent mt-4 rounded-full opacity-50"></div>
          </div>
        </div>
        
        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <div className="flex gap-4">
             <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-sky-500 hover:bg-sky-500 hover:text-white transition-all"><CodeIcon size={18} /></div>
             <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-sky-500 hover:bg-sky-500 hover:text-white transition-all"><Cpu size={18} /></div>
             <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-sky-500 hover:bg-sky-500 hover:text-white transition-all"><Globe size={18} /></div>
          </div>
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.4em]">© {new Date().getFullYear()} Yogesh AI Dynamics Ltd. All Assets Secured.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
