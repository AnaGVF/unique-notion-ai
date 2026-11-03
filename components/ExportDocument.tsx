"use client";

import React, { useState } from "react";
import { Download, FileText, Printer, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { toast } from "sonner";

interface ExportDocumentProps {
    editor: any;
    title?: string;
}

export default function ExportDocument({ editor, title }: ExportDocumentProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const handleExportMarkdown = async () => {
        try {
            setDownloading(true);
            let markdownContent = "";

            if (editor && typeof editor.blocksToMarkdownLossy === "function" && editor.document) {
                markdownContent = editor.blocksToMarkdownLossy(editor.document);
            } else {
                toast.error("Editor content is not ready yet.");
                setDownloading(false);
                return;
            }

            const fileName = `${(title || "Untitled Document").replace(/[\\/:*?"<>|]/g, "_")}.md`;
            const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success(`Exported "${fileName}"!`);
            setIsOpen(false);
        } catch (error) {
            console.error("Export Markdown error:", error);
            toast.error("Failed to export Markdown.");
        } finally {
            setDownloading(false);
        }
    };

    const handleExportPDF = () => {
        setIsOpen(false);
        toast.info("Opening print preview. Select 'Save as PDF' to save.");

        // Blank document.title so browser headers won't print the app title
        const originalTitle = document.title;
        document.title = "";

        // Query and hide any liveblocks attribution badges directly in the DOM
        document.querySelectorAll<HTMLElement>('a[href*="liveblocks.io"], .lb-composer-attribution, .lb-attribution, [data-liveblocks-badge]').forEach((el) => {
            el.style.setProperty("display", "none", "important");
        });

        const restore = () => {
            document.title = originalTitle;
            window.removeEventListener("afterprint", restore);
        };
        window.addEventListener("afterprint", restore);

        setTimeout(() => {
            window.print();
            setTimeout(restore, 2000);
        }, 350);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 h-8 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 transition-colors cursor-pointer"
                >
                    <Download className="w-3.5 h-3.5 text-blue-500" />
                    <span>Export</span>
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader className="space-y-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <Download className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                                Export Document
                            </DialogTitle>
                            <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400">
                                Select an export format for your document.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex flex-col gap-2.5 py-3">
                    {/* Markdown Export Card */}
                    <button
                        type="button"
                        onClick={handleExportMarkdown}
                        disabled={downloading}
                        className="group flex items-center justify-between p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all text-left cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <FileText className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                                Markdown
                            </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 group-hover:translate-x-0.5 transition-all" />
                    </button>

                    {/* PDF Export Card */}
                    <button
                        type="button"
                        onClick={handleExportPDF}
                        className="group flex items-center justify-between p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all text-left cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <Printer className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                                PDF Document
                            </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 group-hover:translate-x-0.5 transition-all" />
                    </button>
                </div>

                {downloading && (
                    <div className="flex items-center justify-center gap-2 py-2 text-xs text-neutral-500">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                        <span>Generating Markdown file...</span>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
