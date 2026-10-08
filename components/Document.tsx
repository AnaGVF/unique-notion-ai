'use client'

import { FormEvent, useEffect, useState, useTransition, useRef } from 'react'
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { CheckCircle2, FileText, Loader2 } from 'lucide-react';

import LoadingSpinner from './LoadingSpinner';
import dynamic from 'next/dynamic';
import useOwner from '@/lib/useOwner';

const Editor = dynamic(() => import('./Editor'), {
    ssr: false,
});
import DeleteDocument from './DeleteDocument';
import InviteUser from './InviteUser';
import ManageUsers from './ManageUsers';
import Avatars from './Avatars';

function Document({ id }: { id: string }) {
    const [data, loading] = useDocumentData(doc(db, "documents", id));
    const [input, setInput] = useState('');
    const [isUpdating, startTransition] = useTransition();
    const [isSaved, setIsSaved] = useState(true);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isOwner = useOwner();

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

    if (loading) {
        return <LoadingSpinner />;
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
            {/* Top Document Toolbar */}
            <div className='flex max-w-6xl mx-auto flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-800/60'>
                {/* Autosave Status Indicator */}
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

                {/* Collaborative & Action Controls */}
                <div className='flex items-center flex-wrap gap-2.5'>
                    <ManageUsers />
                    <Avatars />

                    {isOwner && (
                        <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-800">
                            <InviteUser />
                            <DeleteDocument id={id} />
                        </div>
                    )}
                </div>
            </div>

            {/* Document Header Title */}
            <div className='max-w-6xl mx-auto pt-6 pb-2'>
                {/* Borderless Large Document Title */}
                <input
                    type="text"
                    value={input}
                    placeholder="Untitled Document"
                    onChange={(e) => handleTitleChange(e.target.value)}
                    onBlur={() => saveTitle(input)}
                    onKeyDown={handleKeyDown}
                    className="w-full text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-transparent border-none outline-none focus:outline-none focus:ring-0 placeholder:text-gray-300 dark:placeholder:text-gray-700 p-0 transition-colors"
                />
            </div>

            {/* Editor Canvas */}
            <div className="pt-2">
                <Editor />
            </div>
        </div>
    );
}

export default Document;