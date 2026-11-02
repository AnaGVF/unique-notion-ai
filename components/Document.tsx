'use client'

import { FormEvent, useEffect, useState, useTransition, useRef } from 'react'
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { CheckCircle2, FileText, Loader2, RotateCcw, Star, Trash2 } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

import dynamic from 'next/dynamic';
import useOwner from '@/lib/useOwner';

// Start downloading the (heavy) BlockNote editor bundle immediately when this module
// loads, in parallel with the Firestore + Liveblocks requests, instead of afterwards.
const loadEditor = () => import('./Editor');
if (typeof window !== 'undefined') {
    loadEditor();
}

const Editor = dynamic(loadEditor, {
    ssr: false,
    loading: () => (
        <div className="space-y-2.5 pt-4 animate-pulse">
            <div className="h-4 w-3/4 rounded bg-neutral-100 dark:bg-neutral-900" />
            <div className="h-4 w-5/6 rounded bg-neutral-100 dark:bg-neutral-900" />
            <div className="h-4 w-1/2 rounded bg-neutral-100 dark:bg-neutral-900" />
        </div>
    ),
});
import DeleteDocument from './DeleteDocument';
import InviteUser from './InviteUser';
import ManageUsers from './ManageUsers';
import Avatars from './Avatars';
import DocumentHeaderCustomizer from './DocumentHeaderCustomizer';
import { toggleFavorite, restoreFromTrash } from '@/actions/actions';
import { Button } from './ui/button';
import { toast } from 'sonner';

function Document({ id }: { id: string }) {
    const { user } = useUser();
    const userEmail = user?.emailAddresses[0]?.toString();
    const [data, loading] = useDocumentData(doc(db, "documents", id));
    const [userRoomData] = useDocumentData(
        userEmail ? doc(db, "users", userEmail, "rooms", id) : null
    );

    const [input, setInput] = useState('');
    const [isUpdating, startTransition] = useTransition();
    const [isSaved, setIsSaved] = useState(true);
    const [isFavoriting, startFavoriteTransition] = useTransition();
    const [isRestoring, startRestoreTransition] = useTransition();
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isOwner = useOwner();

    const isFavorite = userRoomData?.isFavorite || false;
    const isTrash = data?.isTrash || false;

    useEffect(() => {
        if (data) {
            setInput(data.title || '');
        }
    }, [data]);

    const saveTitle = (newTitle: string) => {
        const trimmed = newTitle.trim();
        if (!trimmed || trimmed === data?.title) return;

        setIsSaved(false);
        startTransition(async () => {
            await updateDoc(doc(db, "documents", id), {
                title: trimmed,
            });
            setIsSaved(true);
        });
    };

    const handleTitleChange = (val: string) => {
        setInput(val);
        setIsSaved(false);

        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
            saveTitle(val);
        }, 800);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
            saveTitle(input);
            (e.target as HTMLInputElement).blur();
        }
    };

    const handleToggleFavorite = () => {
        startFavoriteTransition(async () => {
            const nextVal = !isFavorite;
            const res = await toggleFavorite(id, nextVal);
            if (res.success) {
                toast.success(nextVal ? "Added to Favorites!" : "Removed from Favorites.");
            } else {
                toast.error("Failed to update Favorites.");
            }
        });
    };

    const handleRestoreDoc = () => {
        startRestoreTransition(async () => {
            const res = await restoreFromTrash(id);
            if (res.success) {
                toast.success("Document restored from Trash!");
            } else {
                toast.error("Failed to restore document.");
            }
        });
    };

    if (loading) {
        return (
            <div className='flex-1 h-full bg-white dark:bg-gray-950 p-6 sm:p-8 md:p-10 rounded-xl shadow-xs border border-gray-200/80 dark:border-gray-800/80 animate-pulse'>
                {/* Skeleton Top Toolbar */}
                <div className='flex max-w-6xl mx-auto items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800/60'>
                    <div className="h-4 w-28 rounded-md bg-neutral-200/80 dark:bg-neutral-800" />
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-20 rounded-md bg-neutral-200/80 dark:bg-neutral-800" />
                        <div className="h-7 w-20 rounded-md bg-neutral-200/80 dark:bg-neutral-800" />
                    </div>
                </div>

                {/* Skeleton Title & Lines */}
                <div className='max-w-6xl mx-auto pt-8 space-y-4'>
                    <div className="h-10 w-2/5 rounded-lg bg-neutral-200/80 dark:bg-neutral-800" />
                    <div className="pt-6 space-y-2.5">
                        <div className="h-4 w-3/4 rounded bg-neutral-100 dark:bg-neutral-900" />
                        <div className="h-4 w-5/6 rounded bg-neutral-100 dark:bg-neutral-900" />
                        <div className="h-4 w-1/2 rounded bg-neutral-100 dark:bg-neutral-900" />
                    </div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center flex-1 min-h-[400px] text-center p-8 bg-white dark:bg-gray-950 rounded-xl border border-gray-200/80 dark:border-gray-800/80">
                <FileText className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-3" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Document Not Found</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This document does not exist or has been deleted.</p>
            </div>
        );
    }

    return (
        <div className='flex-1 h-full bg-white dark:bg-gray-950 p-6 sm:p-8 md:p-10 rounded-xl shadow-xs border border-gray-200/80 dark:border-gray-800/80 transition-colors'>
            {/* Trash Warning Banner */}
            {isTrash && (
                <div className="mb-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between flex-wrap gap-2 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-800 dark:text-amber-300 font-medium">
                        <Trash2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>This document is in the Trash. It is read-only until restored.</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleRestoreDoc}
                            disabled={isRestoring}
                            className="h-7 text-xs gap-1 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                        >
                            {isRestoring ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <RotateCcw className="w-3.5 h-3.5" />
                            )}
                            <span>Restore</span>
                        </Button>
                        {isOwner && <DeleteDocument id={id} isTrash={true} />}
                    </div>
                </div>
            )}

            {/* Top Document Toolbar */}
            <div className='flex max-w-6xl mx-auto flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-800/60 no-print'>
                {/* Autosave Status Indicator & Favorite Star */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        {isUpdating ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                <span>{isSaved ? "Saved to cloud" : "Unsaved changes"}</span>
                            </>
                        )}
                    </div>

                    {/* Star Favorite Toggle */}
                    <button
                        onClick={handleToggleFavorite}
                        disabled={isFavoriting}
                        title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                        className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer group"
                    >
                        <Star
                            className={`w-4 h-4 transition-all ${
                                isFavorite
                                    ? "fill-amber-400 text-amber-500 scale-110"
                                    : "text-neutral-400 group-hover:text-amber-500 group-hover:scale-105"
                            }`}
                        />
                    </button>
                </div>

                {/* Collaborative & Action Controls */}
                <div className='flex items-center flex-wrap gap-2.5'>
                    <ManageUsers />
                    <Avatars />

                    {isOwner && (
                        <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-800">
                            <InviteUser />
                            {!isTrash && <DeleteDocument id={id} isTrash={false} />}
                        </div>
                    )}
                </div>
            </div>

            {/* Document Header Customizer (Cover Banner & Icon) */}
            <div className="max-w-6xl mx-auto pt-4">
                <DocumentHeaderCustomizer
                    id={id}
                    icon={data?.icon}
                    coverImage={data?.coverImage}
                    isOwner={isOwner && !isTrash}
                />
            </div>

            {/* Document Header Title */}
            <div className='max-w-6xl mx-auto pb-2'>
                {/* Borderless Large Document Title */}
                <input
                    type="text"
                    value={input}
                    disabled={isTrash}
                    placeholder="Untitled Document"
                    onChange={(e) => handleTitleChange(e.target.value)}
                    onBlur={() => saveTitle(input)}
                    onKeyDown={handleKeyDown}
                    className="w-full text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-transparent border-none outline-none focus:outline-none focus:ring-0 placeholder:text-gray-300 dark:placeholder:text-gray-700 p-0 transition-colors disabled:opacity-60"
                />
            </div>

            {/* Editor Canvas */}
            <div className="pt-2">
                <Editor title={data?.title || input} />
            </div>
        </div>
    );
}

export default Document;
