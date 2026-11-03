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
} from "@/components/ui/select";
import { 
    ArrowDownToLine,
    BotIcon, 
    Check, 
    Copy, 
    CopyPlus, 
    FileEdit, 
    FileText, 
    Languages, 
    Layers, 
    Loader2, 
    Sparkles, 
    Users 
} from "lucide-react";
import { toast } from "sonner";
import Markdown from "react-markdown";
import { useRouter } from "next/navigation";
import { createTranslatedCopy } from "@/actions/actions";

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

type TranslationMode = "summary" | "full";

type TranslateDocumentProps = {
    doc: Y.Doc;
    editor?: any;
    docId?: string;
    title?: string;
};

function TranslateDocument({ doc, editor, docId, title }: TranslateDocumentProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [summary, setSummary] = useState('');
    const [language, setLanguage] = useState<string>("");
    const [mode, setMode] = useState<TranslationMode>("summary");
    const [isTranslating, startTranslating] = useTransition();
    const [isCopyingDoc, startCopyingDoc] = useTransition();
    const [copied, setCopied] = useState(false);

    const handleTranslate = async (e: FormEvent) => {
        e.preventDefault();
        if (!language) return;

        startTranslating(async () => {
            try {
                let documentData: any = "";
                if (editor && typeof editor.blocksToMarkdownLossy === "function" && editor.document) {
                    try {
                        documentData = editor.blocksToMarkdownLossy(editor.document);
                    } catch (e) {
                        documentData = doc.get('document-store').toJSON();
                    }
                } else {
                    documentData = doc.get('document-store').toJSON();
                }

                // If mode is 'full', send instruction to translate the complete document
                let res: Response;
                if (mode === "full") {
                    const question = `Translate the entire following Markdown document into ${language}. Preserve all headings (#, ##, ###), bullet points (-), checklists (- [ ]), emojis, and formatting. Translate all items accurately into ${language}. Do NOT summarize or shorten anything. Return ONLY the complete translated document directly in clean Markdown format with no conversational filler or explanation.`;
                    res = await fetch(
                        `${process.env.NEXT_PUBLIC_BASE_URL}/chatToDocument`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                documentData,
                                question,
                            }),
                        }
                    );
                } else {
                    // Summary translation mode
                    res = await fetch(
                        `${process.env.NEXT_PUBLIC_BASE_URL}/translateDocument`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                documentData,
                                targetLang: language,
                                mode: "summary",
                            }),
                        }
                    );
                }

                if (res.ok) {
                    const data = await res.json();
                    const text = data.message || data.translatedText || "No translation generated.";
                    setSummary(text);
                    toast.success(
                        mode === "full"
                            ? `Successfully translated full document into ${language}!`
                            : `Successfully translated summary into ${language}!`
                    );
                } else {
                    toast.error("Failed to translate document. Please try again.");
                }
            } catch (err) {
                console.error("Translation request error:", err);
                toast.error("An error occurred during translation.");
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

    // Option 1: In the current document, replace with the FULL translated document
    const handleReplaceCurrentDocument = async () => {
        if (!editor || !language) return;

        startTranslating(async () => {
            try {
                toast.info(`Translating full document into ${language}...`);

                let docContent = "";
                if (typeof editor.blocksToMarkdownLossy === "function" && editor.document) {
                    try {
                        docContent = editor.blocksToMarkdownLossy(editor.document);
                    } catch (e) {}
                }
                if (!docContent) {
                    docContent = doc.get('document-store').toJSON();
                }

                // If mode was already 'full' and summary has the complete document, reuse it
                let fullTranslatedContent = summary;
                if (mode !== "full" || !fullTranslatedContent || fullTranslatedContent.length < 80) {
                    const question = `Translate the entire following Markdown document into ${language}. Preserve all headings (#, ##, ###), bullet lists (-), checklists (- [ ]), emojis, and formatting exactly. Translate every single line, section, and item into ${language}. Do NOT summarize, shorten, or omit anything. Return ONLY the complete translated Markdown document with no introductory or conversational remarks.`;

                    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/chatToDocument`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            documentData: docContent,
                            question,
                        }),
                    });

                    if (res.ok) {
                        const data = await res.json();
                        fullTranslatedContent = data.message || data.translatedText || summary;
                    }
                }

                const blocks = await editor.tryParseMarkdownToBlocks(fullTranslatedContent);
                if (blocks && blocks.length > 0) {
                    editor.replaceBlocks(editor.document, blocks);
                    toast.success(`Current document replaced with full ${language.toUpperCase()} translation!`);
                    setIsOpen(false);
                    return;
                }
            } catch (err) {
                console.error("Replace document error:", err);
                toast.error("Could not replace document content.");
            }
        });
    };

    // Option 2: Append / Insert below existing content
    const handleInsertBelow = async () => {
        if (!summary || !editor) return;

        try {
            const blocks = await editor.tryParseMarkdownToBlocks(summary);
            if (blocks && blocks.length > 0) {
                const lastBlock = editor.document[editor.document.length - 1];
                if (lastBlock) {
                    editor.insertBlocks(blocks, lastBlock, "after");
                } else {
                    editor.replaceBlocks(editor.document, blocks);
                }
                toast.success(`Translation inserted below current content!`);
                setIsOpen(false);
            }
        } catch (err) {
            console.error("Insert below error:", err);
            toast.error("Could not insert translation.");
        }
    };

    // Option 3: Create a copy of the document with the WHOLE CONTENT TRANSLATED while retaining all users' permissions
    const handleCreateTranslatedCopy = () => {
        if (!language) {
            toast.error("Please select a target language.");
            return;
        }
        if (!docId) {
            toast.error("Document ID is required to clone permissions.");
            return;
        }

        startCopyingDoc(async () => {
            try {
                const langLabel = language ? language.charAt(0).toUpperCase() + language.slice(1) : "Translated";
                const baseTitle = title && title.trim() !== "" ? title : "Untitled";
                const targetTitle = `${baseTitle} (${langLabel})`;

                toast.info(`Translating complete document into ${langLabel}...`);

                // 1. Get current document content in clean markdown
                let docContent = "";
                if (editor && typeof editor.blocksToMarkdownLossy === "function" && editor.document) {
                    try {
                        docContent = editor.blocksToMarkdownLossy(editor.document);
                    } catch (e) {
                        console.warn("blocksToMarkdownLossy fallback:", e);
                    }
                }
                if (!docContent) {
                    docContent = doc.get('document-store').toJSON();
                }

                // 2. Translate the entire document (all headings, lists, checklists, emojis)
                let fullTranslatedContent = summary;
                if (mode !== "full" || !fullTranslatedContent || fullTranslatedContent.length < 80) {
                    const question = `Translate the entire following Markdown document into ${language}. Preserve all headings (#, ##, ###), bullet lists (-), checklists (- [ ]), emojis, and formatting exactly. Translate every single line, section, and item into ${language}. Do NOT summarize, shorten, or omit anything. Return ONLY the complete translated Markdown document with no introductory or conversational remarks.`;

                    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/chatToDocument`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            documentData: docContent,
                            question,
                        }),
                    });

                    if (res.ok) {
                        const data = await res.json();
                        fullTranslatedContent = data.message || data.translatedText || summary;
                    }
                }

                // 3. Create the translated copy with full document content and duplicated permissions
                const res = await createTranslatedCopy(docId, targetTitle, fullTranslatedContent);

                if (res.success && res.docId) {
                    toast.success(
                        `Created "${targetTitle}" with full content translated! All collaborator permissions preserved.`,
                        { duration: 4000 }
                    );
                    setIsOpen(false);
                    router.push(`/doc/${res.docId}`);
                } else {
                    toast.error(res.error || "Failed to create translated copy.");
                }
            } catch (err) {
                console.error("Create translated copy error:", err);
                toast.error("An error occurred while creating the translated copy.");
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Button asChild variant="ghost" size="sm" className="gap-1.5 h-8 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 transition-colors">
                <DialogTrigger>
                    <Languages className="w-3.5 h-3.5" />
                    <span>Translate</span>
                </DialogTrigger>
            </Button>

            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
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
                                Translate your document, replace current content, or create a permission-synced translated copy.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Translation Scope Mode Toggle */}
                <div className="flex flex-col gap-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Translation Scope
                    </span>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg border border-neutral-200/80 dark:border-neutral-800">
                        <button
                            type="button"
                            onClick={() => setMode("full")}
                            className={`flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-xs font-medium transition-all cursor-pointer ${
                                mode === "full"
                                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-2xs"
                                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                            }`}
                        >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Full Document</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode("summary")}
                            className={`flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-xs font-medium transition-all cursor-pointer ${
                                mode === "summary"
                                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-2xs"
                                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                            }`}
                        >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Executive Summary</span>
                        </button>
                    </div>
                </div>

                {/* Quick Selection Chips */}
                <div className="flex flex-col gap-1.5 pt-1">
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
                <form className='flex gap-2 pt-1' onSubmit={handleTranslate}>
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
                        disabled={!language || isTranslating}
                        className="bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 font-medium h-9 text-xs px-4 shadow-xs shrink-0 cursor-pointer gap-1.5"
                    >
                        {isTranslating ? (
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

                {/* Translation Result Card & Action Options */}
                {summary && (
                    <div className="flex flex-col gap-3 p-4 bg-neutral-50 dark:bg-neutral-900/60 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 mt-2">
                        {/* Header with Badges and Copy */}
                        <div className="flex items-center justify-between pb-2 border-b border-neutral-200/60 dark:border-neutral-800/60">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-slate-800 text-white flex items-center justify-center">
                                    <BotIcon className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                                    AI Translation ({language.toUpperCase()})
                                </span>
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                    {mode === "full" ? "Full Document" : "Summary"}
                                </span>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopy}
                                className="h-7 px-2 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 gap-1 cursor-pointer"
                            >
                                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copied ? "Copied" : "Copy"}</span>
                            </Button>
                        </div>

                        {/* Translation Markdown Preview */}
                        <div className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 max-h-56 overflow-y-auto leading-relaxed prose prose-sm dark:prose-invert max-w-none p-1">
                            <Markdown>{summary}</Markdown>
                        </div>

                        {/* Action Choices Section */}
                        <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60 space-y-2">
                            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
                                Choose Action
                            </span>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {/* Option 1: Replace Current Document */}
                                <Button
                                    type="button"
                                    onClick={handleReplaceCurrentDocument}
                                    variant="outline"
                                    className="h-9 px-3 flex items-center justify-center gap-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-neutral-800 cursor-pointer"
                                >
                                    <FileEdit className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300 shrink-0" />
                                    <span>Replace Current Doc</span>
                                </Button>

                                {/* Option 2: Create Translated Copy (Full Document + Preserves Permissions) */}
                                <Button
                                    type="button"
                                    onClick={handleCreateTranslatedCopy}
                                    disabled={isCopyingDoc || !docId}
                                    className="h-9 px-3 flex items-center justify-center gap-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white cursor-pointer shadow-xs"
                                >
                                    {isCopyingDoc ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                                            <span>Translating Full Doc...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CopyPlus className="w-3.5 h-3.5 shrink-0" />
                                            <span>Create Translated Copy</span>
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Secondary bar: Permissions badge & Insert Below */}
                            <div className="flex items-center justify-between pt-0.5">
                                <span className="text-[11px] text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    <span>Copies all collaborator permissions</span>
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleInsertBelow}
                                    className="h-7 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 gap-1 cursor-pointer"
                                >
                                    <ArrowDownToLine className="w-3 h-3" />
                                    <span>Insert below</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default TranslateDocument;
