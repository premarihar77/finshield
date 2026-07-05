import { useEffect, useState } from 'react';
import { Bot, MessageCircle, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../api/api';

const defaultQuestions = [
  'Why is this risky?',
  'What should I do if I clicked the link?',
  'What if I shared OTP?',
  'How do I report fraud?',
  'How does Trust Score work?'
];

function readLatestAnalysis() {
  try {
    const saved = localStorage.getItem('finshield_last_analysis');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState(() => readLatestAnalysis());
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hi, I am FinShield Assistant. Ask about UPI scams, suspicious links, payment screenshots, risk scores, or emergency safety steps.'
    }
  ]);
  const [suggestions, setSuggestions] = useState(defaultQuestions);

  useEffect(() => {
    const handleContext = (event) => setLastAnalysis(event.detail || readLatestAnalysis());
    window.addEventListener('finshield:analysis-context', handleContext);
    return () => window.removeEventListener('finshield:analysis-context', handleContext);
  }, []);

  const ask = async (question) => {
    const clean = question.trim();
    if (!clean) return;
    setMessages((items) => [...items, { role: 'user', text: clean }]);
    setInput('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/chatbot/ask', { question: clean, last_analysis: lastAnalysis });
      setMessages((items) => [...items, { role: 'assistant', text: data.answer }]);
      setSuggestions(data.suggested_questions || defaultQuestions);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Assistant is unavailable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 flex h-[34rem] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 bg-slate-950 p-4 text-white">
            <div>
              <div className="flex items-center gap-2 font-bold"><Bot className="h-5 w-5 text-blue-300" /> FinShield Assistant</div>
              <p className="mt-1 text-xs text-slate-300">Ask about scams, risk score, or safety steps</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1 text-slate-300 transition hover:bg-white/10 hover:text-white" aria-label="Close assistant">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'ml-8 bg-blue-600 text-white' : 'mr-8 bg-slate-100 text-slate-700'}`}>
                {message.text}
              </div>
            ))}
            {loading && <div className="mr-8 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500">Typing...</div>}
          </div>

          <div className="border-t border-slate-200 p-3">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {suggestions.slice(0, 3).map((question) => (
                <button key={question} type="button" onClick={() => ask(question)} className="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100">
                  {question}
                </button>
              ))}
            </div>
            <form onSubmit={(event) => { event.preventDefault(); ask(input); }} className="flex gap-2">
              <input value={input} onChange={(event) => setInput(event.target.value)} className="field py-2 text-sm" placeholder="Ask FinShield..." />
              <button type="submit" className="rounded-lg bg-blue-600 px-3 text-white transition hover:bg-blue-700" aria-label="Send message">
                <Send className="h-4 w-4" />
              </button>
            </form>
            <p className="mt-2 text-[11px] leading-4 text-slate-500">Awareness guidance only. Verify through official bank channels.</p>
          </div>
        </div>
      )}

      <button type="button" onClick={() => setOpen((value) => !value)} className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl" aria-label="Open FinShield Assistant">
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
}
