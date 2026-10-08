"use client"

import React, { FormEvent, useEffect, useRef, useState, useTransition } from 'react'
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Input } from './ui/input';
import * as Y from "yjs";
import {
    Bot,
    Check,
    Copy,
    Loader2,
    MessageSquareCode,
    RotateCcw,
    SendHorizontal,
    Sparkles,
    User,
    X,
} from 'lucide-react';
import Markdown from 'react-markdown';

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

const quickPrompts = [
    "What is this document about?",
    "Summarize key action items",
    "List 3 main takeaways",
    "Identify questions left open",
];

function ChatToDocument({ doc }: { doc: Y.Doc }) {
    const [input, setInput] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen, isPending]);

    const askQuestionWithText = (text: string) => {
        const trimmed = text.trim();
        if (!trimmed) return;

        const userMsg: ChatMessage = {
            id: `user-${Date.now()}`,
            role: "user",
            content: trimmed,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");

        startTransition(async () => {
            try {
                const documentData = doc.get('document-store').toJSON();

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/chatToDocument`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            documentData,
                            question: trimmed,
                        })
                    }
                );

                if (res.ok) {
                    const { message } = await res.json();
                    const aiMsg: ChatMessage = {
                        id: `ai-${Date.now()}`,
                        role: "assistant",
                        content: message,
                        timestamp: new Date(),
                    };
                    setMessages((prev) => [...prev, aiMsg]);
                } else {
                    toast.error("Failed to generate AI response");
                }
            } catch (err) {
                toast.error("An error occurred while contacting AI");
            }
        });
    };

    const handleAskQuestion = (e: FormEvent) => {
        e.preventDefault();
        askQuestionWithText(input);
    };

    const handleCopy = (id: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleClearChat = () => {
        setMessages([]);
        toast.success("Chat cleared");
    };

    return (
        <>
            {/* Floating Action Trigger Button (Bottom Right) */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label={isOpen ? "Close Astro AI" : "Open Astro AI"}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-800 dark:hover:bg-slate-700 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all border border-slate-700/60 cursor-pointer group"
                >
                    <div className="relative">
                        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-slate-800"></span>
                    </div>
                    <span className="text-xs font-semibold tracking-wide">
                        {isOpen ? "" : "Ask Astro"}
                    </span>
                </button>
            </div>

            {/* Floating Chat Panel */}
            {isOpen && (
                <div className="fixed bottom-20 right-6 z-50 w-[380px] sm:w-[420px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-7rem)] rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur-xs">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shadow-2xs">
                                <Sparkles className="w-4 h-4 text-amber-300" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                                    Astro
                                    <span className="text-[10px] font-normal px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                        AI
                                    </span>
                                </h3>
                                <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                                    Your workspace AI companion
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            {messages.length > 0 && (
                                <button
                                    onClick={handleClearChat}
                                    title="Clear conversation"
                                    className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 transition-colors cursor-pointer"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                title="Close chat"
                                className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Scroll Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-hide">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center px-3 space-y-3 py-6">
                                <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                                    <MessageSquareCode className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                        Ask Astro anything about this document
                                    </p>
                                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                                        Get summaries, extract action items, or analyze details in real-time.
                                    </p>
                                </div>

                                <div className="w-full pt-2 space-y-1.5">
                                    <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block text-left">
                                        Quick Prompts
                                    </span>
                                    <div className="flex flex-col gap-1.5">
                                        {quickPrompts.map((prompt) => (
                                            <button
                                                key={prompt}
                                                type="button"
                                                onClick={() => askQuestionWithText(prompt)}
                                                disabled={isPending}
                                                className="w-full text-left px-3 py-2 rounded-xl text-xs bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800/50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/70 dark:border-neutral-800 transition-all cursor-pointer flex items-center justify-between group"
                                            >
                                                <span>{prompt}</span>
                                                <Sparkles className="w-3 h-3 text-neutral-400 group-hover:text-amber-500 transition-colors" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"
                                        }`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${msg.role === "user"
                                            ? "bg-slate-800 text-white dark:bg-slate-800 dark:text-slate-100 rounded-br-xs"
                                            : "bg-neutral-100 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 border border-neutral-200/60 dark:border-neutral-700/60 rounded-bl-xs"
                                            }`}
                                    >
                                        {msg.role === "assistant" ? (
                                            <div className="space-y-2">
                                                <div className="prose prose-xs dark:prose-invert max-w-none">
                                                    <Markdown>{msg.content}</Markdown>
                                                </div>
                                                <div className="flex items-center justify-end pt-1 border-t border-neutral-200/60 dark:border-neutral-700/60">
                                                    <button
                                                        onClick={() => handleCopy(msg.id, msg.content)}
                                                        className="inline-flex items-center gap-1 text-[10px] text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors cursor-pointer"
                                                    >
                                                        {copiedId === msg.id ? (
                                                            <>
                                                                <Check className="w-3 h-3 text-emerald-500" />
                                                                <span className="text-emerald-500">Copied</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="w-3 h-3" />
                                                                <span>Copy</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <span>{msg.content}</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}

                        {isPending && (
                            <div className="flex items-center gap-2 p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/60 w-fit text-xs text-neutral-500 dark:text-neutral-400">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-700 dark:text-slate-300" />
                                <span>Astro is thinking...</span>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Footer */}
                    <form
                        onSubmit={handleAskQuestion}
                        className="p-2.5 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur-xs flex items-center gap-2"
                    >
                        <Input
                            placeholder="Ask Astro about this document..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isPending}
                            className="h-9 text-xs bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-xl focus-visible:ring-1 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-600"
                        />
                        <Button
                            type="submit"
                            disabled={!input.trim() || isPending}
                            size="sm"
                            className="h-9 w-9 p-0 bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl shadow-2xs shrink-0 cursor-pointer disabled:opacity-40 transition-colors"
                        >
                            {isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <SendHorizontal className="w-4 h-4" />
                            )}
                        </Button>
                    </form>
                </div>
            )}
        </>
    );
}

export default ChatToDocument;