// src/components/AIAssistant.tsx
'use client';
import { useState, useRef, useEffect } from 'react';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [chat, setChat] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const newChat = [...chat, { role: 'user', content: input }];
    setChat(newChat);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setChat([...newChat, { role: 'assistant', content: data.reply }]);
    } catch {
      setChat([
        ...newChat,
        { role: 'assistant', content: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat, isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="bg-white p-4 rounded-2xl shadow-2xl w-80 h-96 flex flex-col border border-blue-100 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <span className="font-semibold text-blue-700">AI Asistan</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-red-500 transition-colors text-lg"
              aria-label="Kapat"
            >
              ×
            </button>
          </div>
          <div className="overflow-y-auto flex-1 mb-2 px-1 space-y-2 scrollbar-thin scrollbar-thumb-blue-100 scrollbar-track-transparent">
            {chat.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-lg text-sm shadow
                                        ${
                                          msg.role === 'user'
                                            ? 'bg-blue-500 text-white rounded-br-none'
                                            : 'bg-gray-100 text-gray-800 rounded-bl-none border border-blue-100'
                                        }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-400 px-3 py-2 rounded-lg text-sm animate-pulse">
                  Yanıt yazılıyor...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="flex gap-2 mt-1">
            <input
              className="border border-gray-300 rounded-lg px-3 py-2 flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Sorunuzu yazın..."
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
              disabled={loading || !input.trim()}
            >
              Gönder
            </button>
          </div>
        </div>
      )}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 text-lg font-semibold hover:scale-105 transition-transform"
        >
          <span>🤖</span> Asistan
        </button>
      )}
      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 0.25s;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #dbeafe;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
}
