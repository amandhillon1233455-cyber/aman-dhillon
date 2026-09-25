import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Loader2,
  Trash2,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Printer,
  Copy,
  Check,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg_welcome',
      role: 'assistant',
      text: `Hello! I am your **PrintAI Fleet Assistant**.\n\nI have direct, real-time access to your company's live printer fleet database, active spooler queues, error sensor alerts, and user job logs.\n\nHow can I assist your print operations today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { error: toastError, info } = useToast();

  const samplePrompts = [
    'Why is printer 2 showing an error?',
    "Summarize today's printing activity.",
    'Which printer has the most jobs?',
    'What should I do if a printer is offline?',
    'Show me possible issues with recent print jobs.',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      // Build conversation history
      const history = messages.slice(-6).map(m => ({
        role: m.role,
        text: m.text,
      }));

      const res = await api.ai.chat(userMessage.text, history);

      const assistantMessage: ChatMessage = {
        id: `ast_${Date.now()}`,
        role: 'assistant',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('AI Chat Error:', err);
      toastError('AI Error', err.message || 'Failed to process AI chat query.');
      const errorMessage: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        text: 'I encountered an error querying the fleet database. Please verify the backend connection and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    info('Copied', 'Message content copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `msg_welcome_${Date.now()}`,
        role: 'assistant',
        text: 'Chat history cleared. How can I assist your print fleet operations now?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 max-w-5xl mx-auto flex flex-col h-[calc(100vh-6.5rem)]">
      {/* Top Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white">AI Fleet Assistant</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Grounded in live MongoDB printer metrics, error logs, and queue telemetry
            </p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
          title="Clear Conversation History"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Chat</span>
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 shrink-0 scrollbar-none">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 pl-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          Suggested:
        </span>
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={loading}
            className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 text-xs text-slate-300 hover:text-white transition-all whitespace-nowrap shadow-xs disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 p-4 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-y-auto space-y-4">
        {messages.map(msg => {
          const isUser = msg.role === 'user';
          const isCopied = copiedId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-xs ${
                  isUser
                    ? 'bg-gradient-to-tr from-indigo-500 to-purple-600'
                    : 'bg-gradient-to-tr from-indigo-600 to-cyan-500'
                }`}
              >
                {isUser ? 'You' : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-1">
                <div
                  className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-lg relative group ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-xs'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-750 rounded-tl-xs whitespace-pre-wrap'
                  }`}
                >
                  {/* Basic Markdown Rendering */}
                  {msg.text}

                  {/* Copy action for assistant responses */}
                  {!isUser && (
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.text)}
                      className="absolute top-2 right-2 p-1 rounded-md bg-slate-700/60 hover:bg-slate-750 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copy response"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                <div
                  className={`text-[10px] font-mono text-slate-500 px-2 ${isUser ? 'text-right' : 'text-left'}`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3 max-w-xl mr-auto">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-3xl bg-slate-800/90 border border-slate-750 rounded-tl-xs flex items-center gap-3 text-xs text-cyan-300">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Analyzing live MongoDB fleet records...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center gap-3 shrink-0"
      >
        <input
          type="text"
          placeholder="Ask a question about printers, error codes, job volume, or status..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-hidden focus:border-indigo-500 transition-colors disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={loading || !inputText.trim()}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center gap-1.5"
        >
          <span>Ask</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
