"use client"

import React, { FormEvent, useState, useTransition } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Input } from './ui/input';
import * as Y from "yjs";
import { BotIcon, Check, Copy, Loader2, MessageSquareCode, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';

const quickPrompts = [
    "What is this document about?",
    "Summarize key action items",
    "List 3 main takeaways",
];

function ChatToDocument({ doc }: { doc: Y.Doc }) {
    const [input, setInput] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [summary, setSummary] = useState('');
    const [question, setQuestion] = useState('');
    const [copied, setCopied] = useState(false);

    const askQuestionWithText = (text: string) => {
        if (!text.trim()) return;
        setQuestion(text);

        startTransition(async () => {
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
                        question: text,
                    })
                }
            );

            if (res.ok) {
                const { message } = await res.json();
                setInput("");
                setSummary(message);
                toast.success("Response generated!");
            } else {
                toast.error("Failed to ask question");
            }
        });
    };

    const handleAskQuestion = async (e: FormEvent) => {
        e.preventDefault();
        askQuestionWithText(input);
    };

    const handleCopy = () => {
        if (!summary) return;
        navigator.clipboard.writeText(summary);
        setCopied(true);
        toast.success("Copied response to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Button asChild variant="ghost" size="sm" className="gap-1.5 h-8 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 transition-colors">
                <DialogTrigger>
                    <MessageSquareCode className='w-3.5 h-3.5' />
                    <span>Chat to Document</span>
                </DialogTrigger>
            </Button>

            <DialogContent className="sm:max-w-lg">
                <DialogHeader className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-2xs">
                            <MessageSquareCode className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                                Chat with AI
                            </DialogTitle>
                            <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400">
                                Ask any question about this document and receive instant answers.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Quick Prompts */}
                <div className="flex flex-col gap-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Suggested Prompts
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                        {quickPrompts.map((prompt) => (
                            <button
                                key={prompt}
                                type="button"
                                onClick={() => {
                                    setInput(prompt);
                                    askQuestionWithText(prompt);
                                }}
                                disabled={isPending}
                                className="px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-800 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-all cursor-pointer text-left disabled:opacity-50"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Question Input Form */}
                <form className='flex gap-2 pt-2' onSubmit={handleAskQuestion}>
                    <Input
                        placeholder='Ask a question about this doc...'
                        type='text'
                        className='w-full text-xs h-9 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <Button 
                        type='submit' 
                        disabled={!input || isPending}
                        className="bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 font-medium h-9 text-xs px-4 shadow-xs shrink-0 cursor-pointer gap-1.5"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Thinking...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Ask</span>
                            </>
                        )}
                    </Button>
                </form>

                {/* Question & Answer Box */}
                {question && (
                    <div className="flex flex-col gap-2.5 p-4 bg-neutral-50 dark:bg-neutral-900/60 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 mt-2">
                        <div className="flex items-center justify-between pb-2 border-b border-neutral-200/60 dark:border-neutral-800/60">
                            <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 truncate max-w-[280px]">
                                Q: &ldquo;{question}&rdquo;
                            </p>

                            {summary && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCopy}
                                    className="h-7 px-2 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 gap-1"
                                >
                                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                    <span>{copied ? "Copied" : "Copy"}</span>
                                </Button>
                            )}
                        </div>

                        {isPending ? (
                            <div className="flex items-center gap-2 py-4 justify-center text-xs text-neutral-500 dark:text-neutral-400">
                                <Loader2 className="w-4 h-4 animate-spin text-slate-700 dark:text-slate-300" />
                                <span>Analyzing document content...</span>
                            </div>
                        ) : (
                            summary && (
                                <div className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 max-h-64 overflow-y-auto leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                                    <Markdown>{summary}</Markdown>
                                </div>
                            )
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default ChatToDocument