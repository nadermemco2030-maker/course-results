import React, { useState, useRef, useEffect } from 'react';
import type { StudentResult } from './types';

// --- SVG Icons ---
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform -rotate-45" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>;
const BotIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 9a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7a1 1 0 10-2 0v1h-1z" clipRule="evenodd" /></svg>;

interface AIChatViewProps {
    students?: StudentResult[];
}

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

const FormattedText: React.FC<{ text: string }> = ({ text }) => {
    if (!text) return null;
    const lines = text.split('\n');
    return (
        <div className="space-y-1.5 text-[15px] leading-relaxed">
            {lines.map((line, index) => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
                    return (
                        <div key={index} className="flex items-start gap-2 mr-1">
                            <span className="text-indigo-400 mt-2 text-[10px]">●</span>
                            <span className="flex-1" dangerouslySetInnerHTML={{ __html: parseBold(trimmedLine.substring(2)) }} />
                        </div>
                    );
                }
                if (trimmedLine.endsWith(':') || /^\d+\./.test(trimmedLine)) {
                     return <p key={index} className="font-bold text-indigo-700 dark:text-indigo-300 mt-3 mb-1" dangerouslySetInnerHTML={{ __html: parseBold(trimmedLine) }} />;
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
        { sender: 'ai', text: 'أهلاً بك! أنا مساعدك الذكي لتحليل بيانات الخدمة. 📊✨\nيمكنك سؤالي عن إحصائيات الحضور، أو ترتيب الخدام، أو أي تفاصيل أخرى.' }
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
            const systemInstruction = `
            أنت مساعد ذكاء اصطناعي لخدمة الكنيسة. أجب بدقة بناءً على البيانات.
            البيانات: ${JSON.stringify(students.slice(0, 200))}
            `;
            
            // استخدام المسار القياسي للدوال في Netlify
            const response = await fetch('/.netlify/functions/gemini', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ contents: `${systemInstruction}\n\nسؤال المستخدم: ${userMessage.text}` }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                console.error("Server Error:", errData);
                throw new Error(errData.error || `خطأ في الخادم: ${response.status}`);
            }

            const data = await response.json();
            const text = data.text || data.reply || "عذراً، لم يصل رد.";

            setMessages(prev => [...prev, { sender: 'ai', text }]);

        } catch (err: any) {
            console.error("Chat Error:", err);
            setMessages(prev => [...prev, { sender: 'ai', text: `عذراً، حدث خطأ: ${err.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const suggestedPrompts = ["أفضل 5 خدام درجات 🏆", "ملخص الحضور 📉", "قائمة الغياب ⚠️"];

    return (
        <div className="flex flex-col h-[600px] max-h-[75vh] bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden font-sans" dir="rtl">
            <div className="bg-white dark:bg-slate-800 p-4 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3 shadow-sm z-10">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-full"><SparklesIcon /></div>
                <div><h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">المساعد الذكي</h3><p className="text-xs text-slate-500 dark:text-slate-400">متصل</p></div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-6 bg-slate-50 dark:bg-slate-900 scroll-smooth">
                {messages.map((msg, index) => (
                     <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-fade-in-up`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border ${msg.sender === 'ai' ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white'}`}>{msg.sender === 'ai' ? <BotIcon/> : <UserIcon/>}</div>
                        <div className={`px-5 py-3.5 rounded-2xl max-w-[85%] shadow-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none'}`}>
                            {msg.sender === 'ai' ? <FormattedText text={msg.text} /> : <p className="text-[15px]">{msg.text}</p>}
                        </div>
                    </div>
                ))}
                {isLoading && <div className="flex items-center gap-2 text-gray-400 text-sm p-4">جاري الكتابة...</div>}
                <div ref={chatEndRef} />
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
                <div className="flex gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
                    {suggestedPrompts.map((p, i) => <button key={i} onClick={() => handleSendMessage(undefined, p)} className="px-3 py-1 bg-gray-100 text-xs rounded-full whitespace-nowrap hover:bg-indigo-100 text-indigo-700">{p}</button>)}
                </div>
                <form onSubmit={(e) => handleSendMessage(e)} className="relative flex items-center gap-2">
                    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="اكتب سؤالك هنا..." className="w-full pl-4 pr-12 py-3.5 bg-gray-100 rounded-xl focus:ring-0 text-sm" disabled={isLoading} />
                    <button type="submit" disabled={isLoading || !input.trim()} className="absolute left-2 p-2 bg-indigo-600 text-white rounded-lg"><SendIcon /></button>
                </form>
            </div>
        </div>
    );
};