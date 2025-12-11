import React, { useState, useRef, useEffect } from 'react';
import type { StudentResult } from './types';
import { Bot, User, Sparkles, Send, Loader2 } from 'lucide-react';

// --- SVG Icons Fallback (in case lucide fails loading) ---
// (We keep using Lucide imports above, but fallback logic isn't strictly needed if lucide is installed)

interface AIChatViewProps {
    students?: StudentResult[];
    onClose?: () => void;
}

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

// --- Text Formatter Component ---
const FormattedText: React.FC<{ text: string }> = ({ text }) => {
    if (!text) return null;
    const lines = text.split('\n');
    
    return (
        <div className="space-y-1.5 text-[15px] leading-relaxed">
            {lines.map((line, index) => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
                    const content = trimmedLine.substring(2);
                    return (
                        <div key={index} className="flex items-start gap-2 mr-1">
                            <span className="text-indigo-400 mt-2 text-[10px]">●</span>
                            <span className="flex-1" dangerouslySetInnerHTML={{ __html: parseBold(content) }} />
                        </div>
                    );
                }
                if (trimmedLine.endsWith(':') || /^\d+\./.test(trimmedLine)) {
                     return (
                        <p key={index} className="font-bold text-indigo-700 dark:text-indigo-300 mt-3 mb-1" dangerouslySetInnerHTML={{ __html: parseBold(trimmedLine) }} />
                     );
                }
                if (trimmedLine === '') return <div key={index} className="h-1"></div>;
                return <p key={index} dangerouslySetInnerHTML={{ __html: parseBold(line) }} />;
            })}
        </div>
    );
};

const parseBold = (text: string) => {
    const safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return safeText.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-indigo-900 dark:text-indigo-100">$1</strong>');
};

export const AIChatView: React.FC<AIChatViewProps> = ({ students = [] }) => {
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'ai', text: 'أهلاً بك يا خادم الرب! ✝️\nأنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم في تحليل البيانات؟' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSendMessage = async (e?: React.FormEvent, customInput?: string) => {
        if (e) e.preventDefault();
        const textToSend = customInput || input;
        
        if (!textToSend.trim() || isLoading) return;

        const userMessage: Message = { sender: 'user', text: textToSend };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        
        try {
            const dataContext = students.length > 0 ? `البيانات المتاحة: ${JSON.stringify(students.slice(0, 100))}` : "لا توجد بيانات طلاب متاحة حالياً.";
            
            const prompt = `
            أنت مساعد ذكاء اصطناعي لخدمة الكنيسة.
            أجب على سؤال المستخدم بناءً على البيانات التالية (إن وجدت).
            ${dataContext}
            
            سؤال المستخدم: ${userMessage.text}
            `;

            console.log("Sending request to /api/gemini..."); // Debug log

            // استخدام المسار الجديد الذي قمنا بضبطه في netlify.toml
            const response = await fetch('/api/gemini', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ contents: prompt }),
            });

            console.log("Response status:", response.status); // Debug log

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.details || `خطأ في الخادم: ${response.status}`);
            }

            const data = await response.json();
            const text = data.text || data.reply || "عذراً، لم يصلني رد مفهوم.";

            setMessages(prev => [...prev, { sender: 'ai', text }]);

        } catch (err: any) {
            console.error("Chat Error:", err);
            setMessages(prev => [...prev, { sender: 'ai', text: `عذراً، حدث خطأ: ${err.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const suggestedPrompts = [
        "من هم أعلى الخدام درجات؟ 🏆",
        "كم عدد الخدام المسجلين؟ 📊",
        "لخص لي حالة الحضور",
    ];

    return (
        <div className="flex flex-col h-[600px] max-h-[75vh] bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden font-sans" dir="rtl">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 p-4 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3 shadow-sm z-10">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-full">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">المساعد الذكي</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">متصل وجاهز للمساعدة</p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 bg-slate-50 dark:bg-slate-900 scroll-smooth">
                {messages.map((msg, index) => (
                     <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-fade-in-up`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-100 dark:border-slate-700 ${msg.sender === 'ai' ? 'bg-white dark:bg-slate-800 text-indigo-600' : 'bg-indigo-600 text-white'}`}>
                            {msg.sender === 'ai' ? <Bot className="w-6 h-6" /> : <User className="w-6 h-6" />}
                        </div>
                        
                        <div className={`px-5 py-3.5 rounded-2xl max-w-[85%] md:max-w-xl shadow-sm ${
                            msg.sender === 'user' 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border border-gray-200 dark:border-slate-700'
                        }`}>
                            {msg.sender === 'ai' ? (
                                <FormattedText text={msg.text} />
                            ) : (
                                <p className="text-[15px]">{msg.text}</p>
                            )}
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex items-start gap-3 animate-pulse">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 text-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-200 dark:border-slate-700">
                            <Bot className="w-6 h-6" />
                        </div>
                        <div className="px-5 py-4 rounded-2xl bg-white dark:bg-slate-800 rounded-tl-none shadow-sm border border-gray-200 dark:border-slate-700">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
            
            {/* Suggested Prompts */}
            {!isLoading && (
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {suggestedPrompts.map((prompt, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => handleSendMessage(undefined, prompt)} 
                                className="flex-shrink-0 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-full border border-indigo-100 dark:border-slate-600 transition-colors shadow-sm whitespace-nowrap"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
                <form onSubmit={(e) => handleSendMessage(e)} className="relative flex items-center gap-2">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="اكتب سؤالك هنا..." 
                        className="w-full pl-4 pr-12 py-3.5 bg-gray-100 dark:bg-slate-900 border-transparent focus:bg-white dark:focus:bg-black focus:border-indigo-500 rounded-xl focus:ring-0 text-slate-800 dark:text-slate-100 placeholder-gray-400 transition-all shadow-inner text-sm"
                        disabled={isLoading}
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading || !input.trim()} 
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </form>
            </div>
        </div>
    );
};