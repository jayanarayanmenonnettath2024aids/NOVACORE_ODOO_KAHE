import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your Traveloop AI assistant. How can I help you plan your next adventure today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('https://agent-prod.studio.lyzr.ai/v3/inference/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'sk-default-UVwrao9HeTWXak5gb3d0cf1VWSZ3O4Bv'
        },
        body: JSON.stringify({
          user_id: "kungumapriyaamkp5@gmail.com",
          agent_id: "6a0045d4f1247aea914a30eb",
          session_id: "6a0045d4f1247aea914a30eb-vklg28zawcg",
          message: userMessage
        })
      });

      const data = await response.json();
      // Adjusting based on common Lyzr response structures, assuming response contains 'response' or 'message'
      const aiResponse = data.response || data.message || "I'm sorry, I'm having trouble connecting to my knowledge base right now.";
      
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I encountered an error. Please try again in a moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .chatbot-markdown p { margin-bottom: 0.75rem; }
        .chatbot-markdown p:last-child { margin-bottom: 0; }
        .chatbot-markdown ul, .chatbot-markdown ol { margin-left: 1.25rem; margin-bottom: 0.75rem; }
        .chatbot-markdown li { margin-bottom: 0.25rem; }
        .chatbot-markdown strong { font-weight: 800; color: #111; }
        .chatbot-markdown h1, .chatbot-markdown h2, .chatbot-markdown h3 { font-weight: 900; margin-top: 1rem; margin-bottom: 0.5rem; }
      `}</style>
      {/* Floating Toggle Button with Explicit Label */}
      <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end gap-3">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              className="bg-white px-4 py-2 rounded-2xl shadow-2xl border border-purple-100 flex items-center gap-2 mb-1"
            >
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest whitespace-nowrap">
                Ask AI Travel Assistant
              </span>
              <div className="absolute -bottom-1 right-6 w-3 h-3 bg-white border-r border-b border-purple-100 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white rounded-2xl shadow-[0_10px_40px_rgba(147,51,234,0.5)] flex items-center justify-center border-2 border-white/30 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {isOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-[1000] w-[90vw] md:w-[400px] h-[550px] bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-white/20 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 p-6 text-white flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-widest">Traveloop AI</h3>
                  <div className="flex items-center gap-1.5 opacity-80">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold">Online & Ready</span>
                  </div>
                </div>
              </div>
              <Sparkles className="w-5 h-5 opacity-50" />
            </div>

            {/* Chat Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar"
            >
              {messages.map((msg, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-100 rounded-tr-none' 
                        : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-tl-none chatbot-markdown'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="p-4 rounded-2xl bg-gray-50 text-gray-400 border border-gray-100 rounded-tl-none italic text-xs">
                      Analyzing travel data...
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleChat} className="p-6 border-t border-gray-100 bg-white">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about destinations, budgets..."
                  className="w-full pl-6 pr-14 py-4 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-purple-100 transition-all font-bold text-sm"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center hover:bg-purple-700 transition-all disabled:opacity-50 disabled:grayscale shadow-lg shadow-purple-200"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-center text-gray-400 font-bold mt-4 tracking-widest uppercase">Powered by Lyzr AI Studio</p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
