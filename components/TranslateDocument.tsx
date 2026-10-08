'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import * as Y from "yjs";
import { Button } from "./ui/button";
import { FormEvent, useState, useTransition } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { BotIcon, Check, Copy, Languages, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import Markdown from "react-markdown";

type Language =
    | "english"
    | "spanish"
    | "french"
    | "german"
    | "chinese"
    | "japanese"
    | "korean"
    | "russian"
    | "italian"
    | "portuguese"
    | "dutch"
    | "swedish"
    | "norwegian"
    | "finnish"
    | "danish"
    | "polish"
    | "turkish"
    | "arabic"
    | "hebrew"
    | "hindi";

const languages: Language[] = [
    "english",
    "spanish",
    "french",
    "german",
    "chinese",
    "japanese",
    "korean",
    "russian",
    "italian",
    "portuguese",
    "dutch",
    "swedish",
    "norwegian",
    "finnish",
    "danish",
    "polish",
    "turkish",
    "arabic",
    "hebrew",
    "hindi",
];

const popularLanguages = [
    { label: "Spanish", value: "spanish", flag: "🇪🇸" },
    { label: "French", value: "french", flag: "🇫🇷" },
    { label: "German", value: "german", flag: "🇩🇪" },
    { label: "Italian", value: "italian", flag: "🇮🇹" },
    { label: "Japanese", value: "japanese", flag: "🇯🇵" },
    { label: "Chinese", value: "chinese", flag: "🇨🇳" },
];

function TranslateDocument({ doc }: { doc: Y.Doc }) {
    const [isOpen, setIsOpen] = useState(false);
    const [summary, setSummary] = useState('');
    const [language, setLanguage] = useState<string>("");
    const [isPending, startTransition] = useTransition();
    const [copied, setCopied] = useState(false);

    const handleTranslate = async (e: FormEvent) => {
        e.preventDefault();
        if (!language) return;

        startTransition(async () => {
            const documentData = doc.get('document-store').toJSON();

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/translateDocument`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        documentData,
                        targetLang: language,
                    })
                }
            );

            if (res.ok) {
                const { translatedText } = await res.json();
                setSummary(translatedText);
                toast.success("Successfully translated summary!");
            } else {
                toast.error("Failed to translate document");
            }
        });
    };

    const handleCopy = () => {
        if (!summary) return;
        navigator.clipboard.writeText(summary);
        setCopied(true);
        toast.success("Copied translation to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Button asChild variant="ghost" size="sm" className="gap-1.5 h-8 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 transition-colors">
                <DialogTrigger>
                    <Languages className="w-3.5 h-3.5" />
                    <span>Translate</span>
                </DialogTrigger>
            </Button>

            <DialogContent className="sm:max-w-lg">
                <DialogHeader className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-2xs">
                            <Languages className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                                Translate Document
                            </DialogTitle>
                            <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400">
                                Translate a summary of this document with AI.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Quick Selection Chips */}
                <div className="flex flex-col gap-1.5 pt-2">
                    <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Quick Select
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                        {popularLanguages.map((item) => (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => setLanguage(item.value)}
                                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer border ${
                                    language === item.value
                                        ? "bg-slate-800 text-white border-slate-700 shadow-2xs scale-105"
                                        : "bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200/80 dark:border-neutral-800 hover:bg-neutral-200/60 dark:hover:bg-neutral-800"
                                }`}
                            >
                                <span>{item.flag}</span>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Language Select Dropdown & Submit Form */}
                <form className='flex gap-2 pt-2' onSubmit={handleTranslate}>
                    <Select value={language} onValueChange={(value) => setLanguage(value)}>
                        <SelectTrigger className="w-full text-xs h-9 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                            <SelectValue placeholder="Select target language..." />
                        </SelectTrigger>

                        <SelectContent className="max-h-60">
                            {languages.map((lang) => (
                                <SelectItem key={lang} value={lang} className="text-xs">
                                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button 
                        type='submit' 
                        disabled={!language || isPending}
                        className="bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 font-medium h-9 text-xs px-4 shadow-xs shrink-0 cursor-pointer gap-1.5"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Translating...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Translate</span>
                            </>
                        )}
                    </Button>
                </form>

                {/* Translation Summary Result */}
                {summary && (
                    <div className="flex flex-col gap-2.5 p-4 bg-neutral-50 dark:bg-neutral-900/60 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 mt-2">
                        <div className="flex items-center justify-between pb-2 border-b border-neutral-200/60 dark:border-neutral-800/60">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-slate-800 text-white flex items-center justify-center">
                                    <BotIcon className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                                    AI Translation ({language.toUpperCase()})
                                </span>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopy}
                                className="h-7 px-2 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 gap-1"
                            >
                                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copied ? "Copied" : "Copy"}</span>
                            </Button>
                        </div>

                        <div className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 max-h-64 overflow-y-auto leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                            <Markdown>{summary}</Markdown>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default TranslateDocument;