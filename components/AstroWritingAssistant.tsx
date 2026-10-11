"use client";

import React, { useState, useTransition } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Input } from "./ui/input";
import * as Y from "yjs";
import {
    Briefcase,
    Check,
    CheckSquare,
    Copy,
    FileText,
    ListFilter,
    Loader2,
    MessageSquareQuote,
    Minimize2,
    PenLine,
    PlusCircle,
    RotateCcw,
    Sparkles,
    Wand2,
    Zap,
} from "lucide-react";
import Markdown from "react-markdown";

type AstroAction =
    | "improve"
    | "grammar"
    | "concise"
    | "action-items"
    | "tone-professional"
    | "tone-casual"
    | "expand"
    | "summarize"
    | "custom";

interface ActionItem {
    id: AstroAction;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
}

const actionOptions: ActionItem[] = [
    {
        id: "improve",
        label: "Improve Writing",
        icon: Wand2,
        description: "Elevate flow, vocabulary & clarity",
    },
    {
        id: "grammar",
        label: "Fix Grammar",
        icon: PenLine,
        description: "Correct spelling & grammar mistakes",
    },
    {
        id: "concise",
        label: "Make Concise",
        icon: Minimize2,
        description: "Eliminate wordiness & filler fluff",
    },
    {
        id: "action-items",
        label: "Action Items",
        icon: CheckSquare,
        description: "Extract tasks into a to-do checklist",
    },
    {
        id: "tone-professional",
        label: "Professional Tone",
        icon: Briefcase,
        description: "Polish into corporate executive tone",
    },
    {
        id: "tone-casual",
        label: "Casual Tone",
        icon: MessageSquareQuote,
        description: "Friendly, engaging & conversational",
    },
    {
        id: "expand",
        label: "Continue Writing",
        icon: Zap,
        description: "Elaborate & expand on ideas",
    },
    {
        id: "summarize",
        label: "Summary",
        icon: FileText,
        description: "Create an executive summary",
    },
];

function AstroWritingAssistant({ doc, editor }: { doc: Y.Doc; editor?: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [selectedAction, setSelectedAction] = useState<AstroAction>("improve");
    const [customText, setCustomText] = useState("");
    const [useDocumentScope, setUseDocumentScope] = useState(true);
    const [customInstruction, setCustomInstruction] = useState("");
    const [result, setResult] = useState("");
    const [copied, setCopied] = useState(false);

    // When the dialog opens, capture any text currently selected with the cursor
    const handleOpenChange = (open: boolean) => {
        if (open) {
            let activeSelection = "";
            if (editor && typeof editor.getSelectedText === "function") {
                try {
                    activeSelection = editor.getSelectedText() || "";
                } catch (e) {
                    // fallback
                }
            }
            if (!activeSelection && typeof window !== "undefined") {
                const domSelection = window.getSelection();
                if (domSelection && !domSelection.isCollapsed) {
                    activeSelection = domSelection.toString();
                }
            }

            const trimmedSelection = activeSelection.trim();
            if (trimmedSelection) {
                setCustomText(trimmedSelection);
                setUseDocumentScope(false);
            }
        }
        setIsOpen(open);
    };

    const handleRunAction = (actionOverride?: AstroAction) => {
        const actionToRun = actionOverride || selectedAction;

        // Get full markdown from editor if available, else fallback to raw document-store
        let fullDocumentContent = "";
        if (editor && typeof editor.blocksToMarkdownLossy === "function" && editor.document) {
            try {
                fullDocumentContent = editor.blocksToMarkdownLossy(editor.document);
            } catch (e) {
                // fallback
            }
        }

        const isSelectionMode = !useDocumentScope && customText.trim().length > 0;
        const targetText = isSelectionMode ? customText.trim() : fullDocumentContent;

        let instruction = "";
        switch (actionToRun) {
            case "grammar":
                instruction = "Fix all spelling, punctuation, and grammar mistakes across the ENTIRE text. Preserve all sections, bullet points, and structure. Return the COMPLETE revised text in clean Markdown without conversational filler or skipping any parts.";
                break;
            case "improve":
                instruction = "Improve the flow, vocabulary, clarity, and readability of the ENTIRE provided text from beginning to end. Keep all sections, days, lists, and exercises intact. Do NOT shorten, summarize, truncate, or omit any section. Return the COMPLETE improved text in clean Markdown.";
                break;
            case "concise":
                instruction = "Make the text direct and eliminate unnecessary fluff while keeping all meaningful items, tasks, and details intact. Return in clean Markdown.";
                break;
            case "action-items":
                instruction = "Extract all actionable tasks, next steps, and deliverables into a clean markdown checklist format (- [ ] Task description).";
                break;
            case "tone-professional":
                instruction = "Rewrite the ENTIRE text in a polished, executive, professional corporate tone without omitting any section or detail. Return the complete text in clean Markdown.";
                break;
            case "tone-casual":
                instruction = "Rewrite the ENTIRE text in a friendly, conversational, and engaging tone without omitting any section. Return the complete text in clean Markdown.";
                break;
            case "expand":
                instruction = "Elaborate and expand upon each idea and section with richer detail and structure. Return in clean Markdown.";
                break;
            case "summarize":
                instruction = "Provide a comprehensive summary of this document with key takeaways and bullet points in clean Markdown.";
                break;
            case "custom":
            default:
                instruction = customInstruction.trim() || "Improve this text and format cleanly in Markdown.";
                break;
        }

        const promptText = isSelectionMode
            ? `Instruction: ${instruction}\n\nSelected Text to Transform:\n"""\n${targetText}\n"""\n\nReturn ONLY the processed text directly in clean Markdown.`
            : `Instruction: ${instruction}\n\nDocument to Transform:\n"""\n${targetText || "Please transform the document."}\n"""\n\nIMPORTANT: Rewrite and output the COMPLETE document from beginning to end. Do NOT cut off, do NOT truncate, and do NOT omit any parts. Return ONLY the rewritten document directly in clean Markdown.`;

        startTransition(async () => {
            try {
                const documentData = targetText || doc.get("document-store").toJSON();

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/chatToDocument`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            documentData,
                            question: promptText,
                        }),
                    }
                );

                if (res.ok) {
                    const data = await res.json();
                    setResult(data.message || data.result || "No response generated.");
                    toast.success("Astro generated your text!");
                } else {
                    toast.error("Failed to generate with Astro AI");
                }
            } catch (error) {
                toast.error("An error occurred with Astro AI");
            }
        });
    };

    const handleCopy = () => {
        if (!result) return;
        navigator.clipboard.writeText(result);
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleReplaceDocument = async () => {
        if (!result) return;

        if (editor) {
            try {
                const blocks = await editor.tryParseMarkdownToBlocks(result);
                if (blocks && blocks.length > 0) {
                    editor.replaceBlocks(editor.document, blocks);
                    toast.success("Document replaced with Astro text!");
                    setIsOpen(false);
                    return;
                }
            } catch (err) {
                console.error("Replace blocks error:", err);
            }
        }

        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(result);
        toast.info("Copied to clipboard! You can paste directly into the editor.");
        setIsOpen(false);
    };

    const handleInsertBelow = async () => {
        if (!result) return;

        if (editor) {
            try {
                const blocks = await editor.tryParseMarkdownToBlocks(result);
                if (blocks && blocks.length > 0) {
                    const lastBlock = editor.document[editor.document.length - 1];
                    if (lastBlock) {
                        editor.insertBlocks(blocks, lastBlock, "after");
                    } else {
                        editor.replaceBlocks(editor.document, blocks);
                    }
                    toast.success("Inserted below existing content!");
                    setIsOpen(false);
                    return;
                }
            } catch (err) {
                console.error("Insert blocks error:", err);
            }
        }

        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(result);
        toast.info("Copied to clipboard! You can paste directly into the editor.");
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <Button
                asChild
                variant="ghost"
                size="sm"
                className="gap-1.5 h-8 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 transition-colors"
            >
                <DialogTrigger>
                    <Wand2 className="w-3.5 h-3.5 text-amber-500" />
                    <span>Astro Writer</span>
                </DialogTrigger>
            </Button>

            <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <DialogHeader className="space-y-2 pb-2 border-b border-neutral-200/80 dark:border-neutral-800/80">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-2xs">
                            <Sparkles className="w-5 h-5 text-amber-300" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                                Astro Writing Assistant
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                    AI Actions
                                </span>
                            </DialogTitle>
                            <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400">
                                Refine, rewrite, fix grammar, or expand your document in real-time.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-1 scrollbar-hide">
                    {/* Scope Selector */}
                    <div className="flex items-center gap-2 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-xs w-fit">
                        <button
                            type="button"
                            onClick={() => setUseDocumentScope(true)}
                            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                                useDocumentScope
                                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-2xs"
                                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                            }`}
                        >
                            Entire Document
                        </button>
                        <button
                            type="button"
                            onClick={() => setUseDocumentScope(false)}
                            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                                !useDocumentScope
                                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-2xs"
                                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                            }`}
                        >
                            Custom Text Selection
                        </button>
                    </div>

                    {!useDocumentScope && (
                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                                Paste Text to Transform
                            </label>
                            <textarea
                                value={customText}
                                onChange={(e) => setCustomText(e.target.value)}
                                placeholder="Paste or type text you'd like Astro to refine..."
                                rows={3}
                                className="w-full text-xs p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-600 resize-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
                            />
                        </div>
                    )}

                    {/* Action Cards Grid */}
                    <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
                            Choose AI Transformation
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {actionOptions.map((item) => {
                                const IconComponent = item.icon;
                                const isSelected = selectedAction === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedAction(item.id);
                                            handleRunAction(item.id);
                                        }}
                                        disabled={isPending}
                                        className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer group disabled:opacity-50 ${
                                            isSelected
                                                ? "bg-slate-800 text-white border-slate-700 shadow-xs"
                                                : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200/80 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between w-full mb-1">
                                            <IconComponent
                                                className={`w-4 h-4 ${
                                                    isSelected
                                                        ? "text-amber-300"
                                                        : "text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-neutral-100"
                                                }`}
                                            />
                                            {isSelected && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold leading-tight">
                                                {item.label}
                                            </p>
                                            <p
                                                className={`text-[10px] line-clamp-1 mt-0.5 ${
                                                    isSelected
                                                        ? "text-slate-300"
                                                        : "text-neutral-400 dark:text-neutral-500"
                                                }`}
                                            >
                                                {item.description}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Custom Prompt Input */}
                    <div className="flex items-center gap-2 pt-1">
                        <Input
                            placeholder="Or type custom prompt (e.g. 'Turn into a step-by-step tutorial')..."
                            value={customInstruction}
                            onChange={(e) => setCustomInstruction(e.target.value)}
                            className="h-9 text-xs bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-xl"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    setSelectedAction("custom");
                                    handleRunAction("custom");
                                }
                            }}
                        />
                        <Button
                            type="button"
                            onClick={() => {
                                setSelectedAction("custom");
                                handleRunAction("custom");
                            }}
                            disabled={isPending || (!customInstruction.trim() && !customText.trim())}
                            size="sm"
                            className="h-9 px-3.5 bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs rounded-xl shadow-2xs shrink-0 cursor-pointer"
                        >
                            {isPending ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                            ) : (
                                <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-300" />
                            )}
                            <span>Run</span>
                        </Button>
                    </div>

                    {/* Result Card */}
                    {result && (
                        <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                                    Astro Output
                                </span>
                                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCopy}
                                        className="h-7 px-2.5 text-xs gap-1 border-neutral-200 dark:border-neutral-800 cursor-pointer"
                                    >
                                        {copied ? (
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
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleInsertBelow}
                                        className="h-7 px-2.5 text-xs gap-1 border-neutral-200 dark:border-neutral-800 cursor-pointer"
                                    >
                                        <PlusCircle className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                                        <span>Insert Below</span>
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleReplaceDocument}
                                        className="h-7 px-2.5 text-xs gap-1 bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-800 dark:hover:bg-slate-700 shadow-2xs cursor-pointer"
                                    >
                                        <RotateCcw className="w-3 h-3" />
                                        <span>Replace Document</span>
                                    </Button>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 max-h-60 overflow-y-auto text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed prose prose-xs dark:prose-invert max-w-none">
                                <Markdown>{result}</Markdown>
                            </div>
                        </div>
                    )}

                    {isPending && (
                        <div className="flex items-center justify-center gap-2.5 py-8 text-xs text-neutral-500 dark:text-neutral-400">
                            <Loader2 className="w-4 h-4 animate-spin text-slate-700 dark:text-slate-300" />
                            <span>Astro is crafting your content...</span>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default AstroWritingAssistant;
