import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";
import { useAppcontext } from "../../context/AppContext";

const Chatbot = () => {
  const { isChatbotOpen, setIsChatbotOpen, axios, user, addToCart, navigate } = useAppcontext();
  const [messages, setMessages] = useState([
    { role: "model", text: "Hello! I'm the GreenCart Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isChatbotOpen) {
      scrollToBottom();
    }
  }, [messages, isChatbotOpen]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!user) {
      setMessages(prev => [...prev, { role: "user", text: input }, { role: "model", text: "Please log in first to chat with me about your orders." }]);
      setInput("");
      return;
    }

    const userMessage = input.trim();
    setInput("");
    
    // Create the history format for Gemini, omitting the very first greeting if we want, or just passing it all
    // Let's pass previous messages except the initial greeting to save tokens, or pass all.
    const historyForApi = messages.slice(1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: msg.text
    }));

    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setIsLoading(true);

    try {
      const { data } = await axios.post("/api/ai/chat", {
        message: userMessage,
        history: historyForApi
      });

      if (data.success) {
        setMessages(prev => [...prev, { role: "model", text: data.response }]);
        
        if (data.actions && data.actions.length > 0) {
          data.actions.forEach(action => {
            if (action.type === "ADD_TO_CART") {
              const qty = action.quantity || 1;
              for (let i = 0; i < qty; i++) {
                addToCart(action.productId);
              }
            } else if (action.type === "REDIRECT") {
              navigate(action.path);
              setIsChatbotOpen(false);
            }
          });
        }
      } else {
        setMessages(prev => [...prev, { role: "model", text: "Sorry, I encountered an error: " + data.message }]);
      }
    } catch (error) {
      let errorMsg = error.response?.data?.message || error.message || "Something went wrong connecting to the server.";
      
      // Make rate limit and service errors much friendlier
      if (errorMsg.includes("429") || errorMsg.includes("Quota exceeded")) {
        const match = errorMsg.match(/retry in ([0-9.]+)s/);
        if (match) {
          const seconds = Math.ceil(parseFloat(match[1]));
          errorMsg = `I'm getting too many requests right now! Please try again in ${seconds} seconds.`;
        } else {
          errorMsg = "I'm getting too many requests right now! Please wait a minute and try again.";
        }
      } else if (errorMsg.includes("503") || errorMsg.includes("unavailable")) {
        errorMsg = "My servers are currently experiencing high traffic. Please try again in a few moments!";
      }

      setMessages(prev => [...prev, { role: "model", text: "Sorry, I encountered an error: " + errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsChatbotOpen(!isChatbotOpen)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-colors z-50 flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isChatbotOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isChatbotOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-[350px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-8rem)] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-emerald-500 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">GreenCart Support</h3>
                  <p className="text-emerald-100 text-xs">AI Assistant</p>
                </div>
              </div>
              <button onClick={() => setIsChatbotOpen(false)} className="text-emerald-100 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-50 dark:bg-slate-900/50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "self-end flex-row-reverse" : "self-start"}`}>
                  <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}>
                    {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm ${msg.role === "user" ? "bg-emerald-500 text-white rounded-tr-sm" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700/50 rounded-tl-sm shadow-sm"}`}>
                    {/* Render markdown linebreaks */}
                    {msg.text.split('\n').map((line, i) => (
                      <span key={i}>
                        {line}
                        {i !== msg.text.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 max-w-[85%] self-start">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-2xl rounded-tl-sm bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm flex items-center gap-1">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800/80">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full pl-4 pr-12 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-full text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none placeholder-slate-400"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white rounded-full transition-colors flex items-center justify-center"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
