"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import * as Y from "yjs";
import {
    Briefcase,
    Check,
    CheckSquare,
    Copy,
    Loader2,
    Minimize2,
    PenLine,
    PlusCircle,
    Replace,
    SendHorizontal,
    Sparkles,
    Wand2,
    X,
    Zap,
} from "lucide-react";
import { toast } from "sonner";
import Markdown from "react-markdown";

interface AstroSelectionToolbarProps {
    doc: Y.Doc;
    editor?: any;
}

export default function AstroSelectionToolbar({ doc, editor }: AstroSelectionToolbarProps) {
    const [selectedText, setSelectedText] = useState("");
    const [toolbarPosition, setToolbarPosition] = useState<{ top: number; left: number } | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [customPrompt, setCustomPrompt] = useState("");
    const [aiResult, setAiResult] = useState("");
    const [isPending, startTransition] = useTransition();
    const [copied, setCopied] = useState(false);
    const savedRangeRef = useRef<Range | null>(null);

    useEffect(() => {
        const handleSelectionChange = () => {
            const selection = window.getSelection();

            // If no text is selected or selection is collapsed
            if (!selection || selection.isCollapsed) {
                // If we're not in the middle of an active AI generation, dismiss immediately
                if (!isPending && !aiResult) {
                    setToolbarPosition(null);
                    setSelectedText("");
                    setIsMenuOpen(false);
                }
                return;
            }

            const text = selection.toString().trim();
            if (text.length < 2) {
                if (!isPending && !aiResult) {
                    setToolbarPosition(null);
                    setSelectedText("");
                    setIsMenuOpen(false);
                }
                return;
            }

            try {
                const range = selection.getRangeAt(0);
                savedRangeRef.current = range.cloneRange();
                const rect = range.getBoundingClientRect();

                if (rect.width === 0 && rect.height === 0) {
                    setToolbarPosition(null);
                    return;
                }

                setSelectedText(text);

                // Smart positioning: place above BlockNote's native formatting toolbar (which is at ~45px above),
                // or place below the selection if near the top of the viewport.
                const hasSpaceAbove = rect.top > 95;
                const topPos = hasSpaceAbove
                    ? rect.top - 90
                    : rect.bottom + 10;

                const leftPos = Math.max(
                    12,
                    Math.min(window.innerWidth - 340, rect.left + rect.width / 2 - 140)
                );

                setToolbarPosition({
                    top: topPos,
                    left: leftPos,
                });
            } catch (e) {
                setToolbarPosition(null);
            }
        };

        const handlePointerDown = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // If clicking outside our toolbar, dismiss immediately unless AI is generating
            if (!target.closest("#astro-selection-toolbar") && !isPending) {
                setToolbarPosition(null);
                setSelectedText("");
                setIsMenuOpen(false);
                setAiResult("");
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setToolbarPosition(null);
                setSelectedText("");
                setIsMenuOpen(false);
                setAiResult("");
            }
        };

        document.addEventListener("selectionchange", handleSelectionChange);
        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("selectionchange", handleSelectionChange);
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isPending, aiResult]);

    const runAstroAction = (actionType: string, customInstructionText?: string) => {
        if (!selectedText.trim()) return;

        setIsMenuOpen(true);
        setAiResult("");

        let promptText = "";
        switch (actionType) {
            case "grammar":
                promptText = `Fix all spelling, punctuation, and grammar mistakes in the following text. Return ONLY the corrected natural text directly without any Markdown headings (no # or ###) or commentary:\n\n"${selectedText}"`;
                break;
            case "improve":
                promptText = `Improve the flow, vocabulary, and clarity of the following text while preserving its exact meaning. Return ONLY the improved natural text directly without Markdown headings (no # or ###):\n\n"${selectedText}"`;
                break;
            case "concise":
                promptText = `Make the following text much more concise by eliminating wordiness and fluff. Return ONLY the concise natural text directly without Markdown headings (no # or ###):\n\n"${selectedText}"`;
                break;
            case "action-items":
                promptText = `Extract actionable tasks from the following text into a clean checklist. Return only the checklist:\n\n"${selectedText}"`;
                break;
            case "professional":
                promptText = `Rewrite the following text in a polished, professional tone. Return ONLY the revised natural text directly without Markdown headings (no # or ###):\n\n"${selectedText}"`;
                break;
            case "expand":
                promptText = `Continue and expand upon the ideas in the following text. Return the expanded natural text without Markdown headings (no # or ###):\n\n"${selectedText}"`;
                break;
            case "custom":
            default:
                promptText = `Apply this instruction: "${customInstructionText || customPrompt}" to the following text:\n\n"${selectedText}"\n\nReturn ONLY the revised text directly without Markdown headings (no # or ###).`;
                break;
        }

        startTransition(async () => {
            try {
                const documentData = doc.get("document-store").toJSON();

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
                    let rawResult = data.message || data.result || "No response generated.";
                    // Clean unwanted markdown header symbols
                    const cleaned = rawResult.replace(/^#{1,6}\s+/gm, "").trim();
                    setAiResult(cleaned);
                    toast.success("Astro generated your edit!");
                } else {
                    toast.error("Failed to generate with Astro AI");
                }
            } catch (error) {
                toast.error("An error occurred with Astro AI");
            }
        });
    };

    const handleReplaceSelection = () => {
        if (!aiResult) return;

        const cleanTextToInsert = aiResult.replace(/^#{1,6}\s+/gm, "").trim();

        try {
            // Restore selection range
            const sel = window.getSelection();
            if (sel && savedRangeRef.current) {
                sel.removeAllRanges();
                sel.addRange(savedRangeRef.current);
            }

            // Replace text
            document.execCommand("insertText", false, cleanTextToInsert);
            toast.success("Replaced selection with Astro edit!");
            handleClose();
        } catch (e) {
            navigator.clipboard.writeText(cleanTextToInsert);
            toast.info("Copied to clipboard (paste anywhere to replace)");
            handleClose();
        }
    };

    const handleInsertBelow = async () => {
        if (!aiResult) return;

        if (editor) {
            try {
                const blocks = await editor.tryParseMarkdownToBlocks(aiResult);
                if (blocks && blocks.length > 0) {
                    const currentCursorBlock = editor.getTextCursorPosition()?.block || editor.document[editor.document.length - 1];
                    if (currentCursorBlock) {
                        editor.insertBlocks(blocks, currentCursorBlock, "after");
                    } else {
                        editor.replaceBlocks(editor.document, blocks);
                    }
                    toast.success("Inserted below selection!");
                    handleClose();
                    return;
                }
            } catch (err) {
                console.error("Insert blocks error:", err);
            }
        }

        navigator.clipboard.writeText(aiResult);
        toast.info("Copied to clipboard!");
        handleClose();
    };

    const handleCopy = () => {
        if (!aiResult) return;
        navigator.clipboard.writeText(aiResult);
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClose = () => {
        setToolbarPosition(null);
        setSelectedText("");
        setIsMenuOpen(false);
        setAiResult("");
        setCustomPrompt("");
    };

    if (!toolbarPosition || !selectedText) return null;

    return (
        <div
            id="astro-selection-toolbar"
            style={{
                position: "fixed",
                top: `${toolbarPosition.top}px`,
                left: `${toolbarPosition.left}px`,
                zIndex: 9999,
            }}
            className="animate-in fade-in zoom-in-95 duration-150 select-none"
        >
            {!isMenuOpen ? (
                /* Compact Floating Selection Toolbar */
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/95 dark:bg-neutral-900/95 text-white backdrop-blur-md border border-slate-700/80 dark:border-neutral-800 shadow-xl">
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white cursor-pointer transition-all hover:scale-105"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                        <span>Ask Astro</span>
                    </button>

                    <div className="w-px h-4 bg-slate-700 dark:bg-neutral-700 mx-0.5" />

                    <button
                        onClick={() => runAstroAction("improve")}
                        title="Improve writing & flow"
                        className="p-1.5 hover:bg-slate-800 dark:hover:bg-neutral-800 rounded-lg text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    >
                        <Wand2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                        onClick={() => runAstroAction("grammar")}
                        title="Fix grammar & typos"
                        className="p-1.5 hover:bg-slate-800 dark:hover:bg-neutral-800 rounded-lg text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    >
                        <PenLine className="w-3.5 h-3.5" />
                    </button>

                    <button
                        onClick={() => runAstroAction("concise")}
                        title="Make more concise"
                        className="p-1.5 hover:bg-slate-800 dark:hover:bg-neutral-800 rounded-lg text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    >
                        <Minimize2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                        onClick={() => runAstroAction("action-items")}
                        title="Extract checklist to-dos"
                        className="p-1.5 hover:bg-slate-800 dark:hover:bg-neutral-800 rounded-lg text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    >
                        <CheckSquare className="w-3.5 h-3.5" />
                    </button>
                </div>
            ) : (
                /* Expanded Astro AI Inline Action Popover */
                <div className="w-[340px] sm:w-[380px] rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col p-3 space-y-2.5">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-1.5 border-b border-neutral-100 dark:border-neutral-800">
                        <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-md bg-slate-800 text-white flex items-center justify-center">
                                <Sparkles className="w-3 h-3 text-amber-300" />
                            </div>
                            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                Astro Inline Assistant
                            </span>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Quick Action Chips */}
                    {!aiResult && !isPending && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                            <button
                                onClick={() => runAstroAction("improve")}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200/80 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
                            >
                                <Wand2 className="w-3 h-3 text-amber-500" />
                                <span>Improve</span>
                            </button>
                            <button
                                onClick={() => runAstroAction("grammar")}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200/80 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
                            >
                                <PenLine className="w-3 h-3 text-blue-500" />
                                <span>Fix Grammar</span>
                            </button>
                            <button
                                onClick={() => runAstroAction("concise")}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200/80 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
                            >
                                <Minimize2 className="w-3 h-3 text-emerald-500" />
                                <span>Concise</span>
                            </button>
                            <button
                                onClick={() => runAstroAction("professional")}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200/80 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
                            >
                                <Briefcase className="w-3 h-3 text-purple-500" />
                                <span>Professional</span>
                            </button>
                            <button
                                onClick={() => runAstroAction("action-items")}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200/80 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
                            >
                                <CheckSquare className="w-3 h-3 text-orange-500" />
                                <span>To-Do List</span>
                            </button>
                            <button
                                onClick={() => runAstroAction("expand")}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200/80 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
                            >
                                <Zap className="w-3 h-3 text-amber-500" />
                                <span>Expand</span>
                            </button>
                        </div>
                    )}

                    {/* Custom Prompt Bar */}
                    <div className="flex items-center gap-1.5">
                        <input
                            type="text"
                            placeholder="Ask Astro to edit this selection..."
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            disabled={isPending}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && customPrompt.trim()) {
                                    runAstroAction("custom", customPrompt);
                                }
                            }}
                            className="flex-1 h-8 px-2.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
                        />
                        <button
                            onClick={() => runAstroAction("custom", customPrompt)}
                            disabled={!customPrompt.trim() || isPending}
                            className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer disabled:opacity-40 transition-colors shrink-0"
                        >
                            {isPending ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <SendHorizontal className="w-3.5 h-3.5" />
                            )}
                        </button>
                    </div>

                    {/* Loading State */}
                    {isPending && (
                        <div className="flex items-center gap-2 py-3 justify-center text-xs text-neutral-500 dark:text-neutral-400">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-700 dark:text-slate-300" />
                            <span>Astro is editing your text...</span>
                        </div>
                    )}

                    {/* AI Output Box */}
                    {aiResult && !isPending && (
                        <div className="space-y-2 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                            <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700 max-h-40 overflow-y-auto text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed prose prose-xs dark:prose-invert max-w-none">
                                <Markdown>{aiResult}</Markdown>
                            </div>

                            <div className="flex items-center justify-between gap-1 pt-1">
                                <button
                                    onClick={handleCopy}
                                    className="px-2 py-1 text-[11px] rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                    <span>{copied ? "Copied" : "Copy"}</span>
                                </button>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={handleInsertBelow}
                                        className="px-2 py-1 text-[11px] rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-1 cursor-pointer transition-colors"
                                    >
                                        <PlusCircle className="w-3 h-3" />
                                        <span>Insert Below</span>
                                    </button>
                                    <button
                                        onClick={handleReplaceSelection}
                                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                    >
                                        <Replace className="w-3 h-3" />
                                        <span>Replace</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
