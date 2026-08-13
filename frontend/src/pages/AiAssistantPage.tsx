import React, { useState } from 'react';
import { Sparkles, Send, Bot, Mail, TrendingUp, ShieldAlert, Check, Copy, Paperclip } from 'lucide-react';
import api from '../api/axios';
import { AiChatResponse, AiEmailResponse, AiForecastResponse } from '../types/crm';

export const AiAssistantPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'email' | 'forecast'>('chat');

  // Chat state
  const [messages, setMessages] = useState<Array<{ sender: 'USER' | 'ASSISTANT'; content: string; citations?: string[] }>>([
    {
      sender: 'ASSISTANT',
      content: 'Hello! I am NexusAI, your CRM co-pilot. I have secure access to your organization database and Knowledge Base documents. How can I assist your sales team today?',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Email Generator state
  const [recipientName, setRecipientName] = useState('John Doe');
  const [purpose, setPurpose] = useState('Follow up after pricing demo');
  const [tone, setTone] = useState('Professional');
  const [contextText, setContextText] = useState('Interested in 15% annual commitment discount');
  const [generatedEmail, setGeneratedEmail] = useState<AiEmailResponse | null>(null);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Forecast state
  const [forecast, setForecast] = useState<AiForecastResponse | null>(null);

  const presets = [
    'Show me my highest-value deals',
    'Which leads haven\'t been contacted in 14 days?',
    'Summarize Acme Corp',
    'What should I do today?',
    'Which deals are at risk?',
  ];

  const handleSendMessage = async (queryText?: string) => {
    const text = queryText || inputQuery;
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { sender: 'USER', content: text }]);
    if (!queryText) setInputQuery('');
    setIsChatLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        conversationId,
        message: text,
      });
      const data: AiChatResponse = res.data;
      setConversationId(data.conversationId);
      setMessages((prev) => [...prev, { sender: 'ASSISTANT', content: data.message, citations: data.citations }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ASSISTANT', content: 'Apologies, I encountered an issue querying your workspace data. Please try again.' },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGenerateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmailLoading(true);
    try {
      const res = await api.post('/ai/email-generator', {
        recipientName,
        purpose,
        tone,
        context: contextText,
      });
      setGeneratedEmail(res.data);
    } catch (err) {
      alert('Failed to generate email draft');
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleFetchForecast = async () => {
    try {
      const res = await api.get('/ai/forecast');
      setForecast(res.data);
    } catch (e) {
      console.error('Failed to fetch AI sales forecast', e);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-400" />
            NexusAI Copilot Studio
          </h1>
          <p className="text-xs text-slate-400">Context-aware AI intelligence trained strictly on your organization database</p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'chat' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Chat Assistant</span>
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'email' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email Composer</span>
          </button>
          <button
            onClick={() => { setActiveTab('forecast'); handleFetchForecast(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'forecast' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Sales Forecast</span>
          </button>
        </div>
      </div>

      {/* Tab 1: AI Chat Assistant */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Box */}
          <div className="lg:col-span-3 glass-card rounded-2xl border border-slate-800 flex flex-col h-[600px]">
            {/* Message Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ASSISTANT' && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white flex-shrink-0 shadow">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`p-4 rounded-2xl max-w-xl text-xs leading-relaxed ${
                      msg.sender === 'USER'
                        ? 'bg-brand-600 text-white rounded-br-none shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-brand-300 font-mono">
                        <span className="font-bold">Citations: </span>
                        {msg.citations.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isChatLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-400">
                    <Sparkles className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-400">
                    Analyzing CRM database & knowledge base...
                  </div>
                </div>
              )}
            </div>

            {/* Input Box */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex gap-2">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask AI about your leads, deals, revenue forecast, or documents..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
              <button
                onClick={() => handleSendMessage()}
                className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
          </div>

          {/* Quick Presets Sidebar */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider font-mono">Suggested Queries</h3>
            <div className="space-y-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(preset)}
                  className="w-full text-left p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors"
                >
                  "{preset}"
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: AI Email Generator */}
      {activeTab === 'email' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-200">AI Email Generator</h3>
            <form onSubmit={handleGenerateEmail} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300">Recipient Name</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">Purpose of Email *</label>
                <input
                  type="text"
                  required
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Schedule technical onboarding session"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="Professional">Professional</option>
                  <option value="Friendly">Friendly</option>
                  <option value="Concise">Concise</option>
                  <option value="Persuasive">Persuasive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">Contextual Details</label>
                <textarea
                  rows={3}
                  value={contextText}
                  onChange={(e) => setContextText(e.target.value)}
                  placeholder="Additional background for the AI..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isEmailLoading}
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/20"
              >
                {isEmailLoading ? 'Drafting Email...' : 'Generate Email Preview'}
              </button>
            </form>
          </div>

          {/* Email Preview Box */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-200">Email Preview (Confirmation Required)</h3>
                {generatedEmail && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>

              {generatedEmail ? (
                <div className="mt-4 space-y-3 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="font-bold text-slate-400">Subject: </span>
                    <span className="text-slate-100 font-semibold">{generatedEmail.subject}</span>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 whitespace-pre-line leading-relaxed">
                    {generatedEmail.body}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-12 text-center">Fill in the fields on the left and click 'Generate Email Preview'.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Sales Forecast */}
      {activeTab === 'forecast' && (
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
          <h3 className="font-bold text-sm text-slate-200">AI Sales Forecasting Engine</h3>
          {forecast ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-semibold">Actual Won Revenue</span>
                <p className="text-xl font-extrabold text-emerald-400 mt-1">${forecast.actualRevenue.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-semibold">AI Forecasted Revenue</span>
                <p className="text-xl font-extrabold text-brand-400 mt-1">${forecast.forecastedRevenue.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-semibold">Confidence Score</span>
                <p className="text-xl font-extrabold text-purple-400 mt-1">{(forecast.confidenceScore * 100).toFixed(0)}%</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Loading AI Sales Forecast...</p>
          )}
        </div>
      )}
    </div>
  );
};
