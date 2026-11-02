"use client";

import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { Button } from "./ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "./ui/input";
import { Image, Smile, Trash2, X } from "lucide-react";
import { toast } from "sonner";

interface DocumentHeaderCustomizerProps {
    id: string;
    icon?: string;
    coverImage?: string;
    isOwner?: boolean;
}

const PRESET_COVERS = [
    { name: "Cosmic Indigo", value: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)" },
    { name: "Sunset Horizon", value: "linear-gradient(135deg, #f97316 0%, #e11d48 50%, #8b5cf6 100%)" },
    { name: "Ocean Depth", value: "linear-gradient(135deg, #0284c7 0%, #2563eb 50%, #4f46e5 100%)" },
    { name: "Emerald Glade", value: "linear-gradient(135deg, #059669 0%, #10b981 50%, #047857 100%)" },
    { name: "Obsidian Night", value: "linear-gradient(135deg, #18181b 0%, #27272a 50%, #09090b 100%)" },
    { name: "Golden Amber", value: "linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #b45309 100%)" },
    { name: "Pastel Lavender", value: "linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)" },
    { name: "Cyberpunk Neon", value: "linear-gradient(135deg, #06b6d4 0%, #ec4899 100%)" },
];

const POPULAR_EMOJIS = [
    "📝", "💡", "🚀", "🪐", "🎯", "📚", "🎨", "💼", "🔬",
    "⚡", "🔥", "💻", "🧠", "🌿", "✨", "☕", "🌟", "📌",
    "🗂️", "📖", "🏆", "✈️", "🎵", "🛠️", "🦄", "📊", "🧩"
];

export default function DocumentHeaderCustomizer({
    id,
    icon,
    coverImage,
    isOwner = true,
}: DocumentHeaderCustomizerProps) {
    const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
    const [isIconModalOpen, setIsIconModalOpen] = useState(false);
    const [customUrl, setCustomUrl] = useState("");
    const [customEmojiInput, setCustomEmojiInput] = useState("");

    const handleSetCover = async (val: string) => {
        try {
            await updateDoc(doc(db, "documents", id), {
                coverImage: val,
            });
            setIsCoverModalOpen(false);
            toast.success("Cover updated!");
        } catch (error) {
            console.error("Cover update error:", error);
            toast.error("Failed to update cover.");
        }
    };

    const handleRemoveCover = async () => {
        try {
            await updateDoc(doc(db, "documents", id), {
                coverImage: null,
            });
            toast.success("Cover removed.");
        } catch (error) {
            console.error("Remove cover error:", error);
        }
    };

    const handleSetIcon = async (emoji: string) => {
        try {
            await updateDoc(doc(db, "documents", id), {
                icon: emoji,
            });
            setIsIconModalOpen(false);
            setCustomEmojiInput("");
            toast.success("Icon updated!");
        } catch (error) {
            console.error("Icon update error:", error);
            toast.error("Failed to update icon.");
        }
    };

    const handleRemoveIcon = async () => {
        try {
            await updateDoc(doc(db, "documents", id), {
                icon: null,
            });
            setIsIconModalOpen(false);
            toast.success("Icon removed.");
        } catch (error) {
            console.error("Remove icon error:", error);
        }
    };

    return (
        <div className="w-full relative select-none">
            {/* Cover Banner */}
            {coverImage ? (
                <div className="relative group w-full h-40 sm:h-52 rounded-2xl overflow-hidden mb-6 shadow-xs border border-neutral-200/50 dark:border-neutral-800/50 transition-all">
                    {coverImage.startsWith("linear-gradient") ? (
                        <div
                            className="w-full h-full"
                            style={{ background: coverImage }}
                        />
                    ) : (
                        <img
                            src={coverImage}
                            alt="Document Cover"
                            className="w-full h-full object-cover"
                        />
                    )}

                    {isOwner && (
                        <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 bg-neutral-900/80 backdrop-blur-md p-1 rounded-xl text-white text-xs">
                            <button
                                onClick={() => setIsCoverModalOpen(true)}
                                className="px-2.5 py-1 rounded-lg hover:bg-white/20 transition-colors flex items-center gap-1.5"
                            >
                                <Image className="w-3.5 h-3.5" />
                                <span>Change cover</span>
                            </button>
                            <button
                                onClick={handleRemoveCover}
                                className="px-2.5 py-1 rounded-lg hover:bg-white/20 transition-colors flex items-center gap-1.5 text-red-300 hover:text-red-200"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove</span>
                            </button>
                        </div>
                    )}
                </div>
            ) : null}

            {/* Icon & Action Triggers Above Title */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
                {/* Active Icon Display or Trigger */}
                {icon ? (
                    <div className="relative group">
                        <button
                            onClick={() => isOwner && setIsIconModalOpen(true)}
                            className={`text-4xl sm:text-5xl p-2 rounded-2xl transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800/80 cursor-pointer ${
                                coverImage ? "-mt-10 sm:-mt-12 bg-white dark:bg-gray-950 shadow-md ring-4 ring-white dark:ring-gray-950" : ""
                            }`}
                            title={isOwner ? "Change document icon" : undefined}
                        >
                            {icon}
                        </button>
                    </div>
                ) : null}

                {/* Quick "Add icon" & "Add cover" buttons when missing */}
                {isOwner && (
                    <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity text-xs text-neutral-500 dark:text-neutral-400">
                        {!icon && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsIconModalOpen(true)}
                                className="h-7 px-2 text-xs gap-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            >
                                <Smile className="w-3.5 h-3.5" />
                                <span>Add icon</span>
                            </Button>
                        )}
                        {!coverImage && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsCoverModalOpen(true)}
                                className="h-7 px-2 text-xs gap-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            >
                                <Image className="w-3.5 h-3.5" />
                                <span>Add cover</span>
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Change Cover Modal */}
            <Dialog open={isCoverModalOpen} onOpenChange={setIsCoverModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold">Choose a Cover</DialogTitle>
                        <DialogDescription className="text-xs">
                            Select a designer gradient or paste a custom image URL.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Presets Grid */}
                    <div className="space-y-3 py-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                            Designer Gradients
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                            {PRESET_COVERS.map((preset) => (
                                <button
                                    key={preset.name}
                                    onClick={() => handleSetCover(preset.value)}
                                    className="h-16 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden relative group transition-transform hover:scale-[1.02] cursor-pointer"
                                    style={{ background: preset.value }}
                                >
                                    <span className="absolute bottom-1.5 left-2 text-[10px] font-semibold text-white bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-xs">
                                        {preset.name}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Custom Image URL */}
                        <div className="pt-2 space-y-1.5">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                                Or Image Link
                            </span>
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder="https://images.unsplash.com/..."
                                    value={customUrl}
                                    onChange={(e) => setCustomUrl(e.target.value)}
                                    className="h-9 text-xs"
                                />
                                <Button
                                    size="sm"
                                    onClick={() => customUrl.trim() && handleSetCover(customUrl.trim())}
                                    disabled={!customUrl.trim()}
                                    className="h-9 text-xs shrink-0"
                                >
                                    Apply
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Change Icon Modal */}
            <Dialog open={isIconModalOpen} onOpenChange={setIsIconModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="flex flex-row items-center justify-between">
                        <div>
                            <DialogTitle className="text-base font-bold">Select Document Icon</DialogTitle>
                            <DialogDescription className="text-xs">
                                Pick an emoji or enter your own.
                            </DialogDescription>
                        </div>
                        {icon && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRemoveIcon}
                                className="h-7 text-xs text-red-500 hover:text-red-600 gap-1"
                            >
                                <Trash2 className="w-3 h-3" />
                                <span>Remove</span>
                            </Button>
                        )}
                    </DialogHeader>

                    {/* Popular Emojis Grid */}
                    <div className="py-2 space-y-3">
                        <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5">
                            {POPULAR_EMOJIS.map((emoji) => (
                                <button
                                    key={emoji}
                                    onClick={() => handleSetIcon(emoji)}
                                    className="w-10 h-10 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center text-xl transition-transform hover:scale-110 cursor-pointer"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>

                        {/* Custom Emoji Input */}
                        <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                            <Input
                                placeholder="Paste or type any emoji..."
                                value={customEmojiInput}
                                onChange={(e) => setCustomEmojiInput(e.target.value)}
                                className="h-9 text-xs"
                            />
                            <Button
                                size="sm"
                                onClick={() => customEmojiInput.trim() && handleSetIcon(customEmojiInput.trim())}
                                disabled={!customEmojiInput.trim()}
                                className="h-9 text-xs shrink-0"
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

