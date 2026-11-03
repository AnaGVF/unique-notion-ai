"use client"

import { useRoom } from '@liveblocks/react/suspense';
import * as Y from "yjs";
import React, { useEffect, useState } from 'react'
import { LiveblocksYjsProvider } from '@liveblocks/yjs'

import { BlockNoteView } from "@blocknote/shadcn";
import { useCreateBlockNote } from "@blocknote/react";
import { withCollaboration } from "@blocknote/core/yjs";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import { useSelf } from '@liveblocks/react';
import stringToColor from '@/lib/stringToColor';
import TranslateDocument from './TranslateDocument';
import ChatToDocument from './ChatToDocument';
import AstroWritingAssistant from './AstroWritingAssistant';
import AstroSelectionToolbar from './AstroSelectionToolbar';
import ExportDocument from './ExportDocument';
import { useTheme } from 'next-themes';
import { doc as docRef, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useRef } from 'react';

type EditorProps = {
    doc: Y.Doc;
    provider: LiveblocksYjsProvider;
    darkMode: boolean;
    title?: string;
    id?: string;
    initialContent?: string | null;
};

function BlockNote({ doc, provider, darkMode, title, id, initialContent }: EditorProps) {
    const userInfo = useSelf((me) => me.info);
    const initialContentApplied = useRef(false);

    const editor = useCreateBlockNote(
        withCollaboration({
            collaboration: {
                provider: provider as unknown as Parameters<
                    typeof withCollaboration
                >[0]["collaboration"]["provider"],
                fragment: doc.getXmlFragment("document-store"),
                user: {
                    name: userInfo?.name || "Anonymous",
                    color: stringToColor(userInfo?.email || "anonymous"),
                },
            },
        }),
        [doc, provider, userInfo?.name, userInfo?.email]
    );

    // If initialContent is provided from a cloned/translated copy, populate the editor once ready
    useEffect(() => {
        if (!editor || !initialContent || initialContentApplied.current) return;

        // Check if document is newly created and empty
        const isDocEmpty =
            editor.document.length === 0 ||
            (editor.document.length === 1 &&
                editor.document[0].type === "paragraph" &&
                (!editor.document[0].content || editor.document[0].content.length === 0));

        if (isDocEmpty) {
            initialContentApplied.current = true;
            (async () => {
                try {
                    const blocks = await editor.tryParseMarkdownToBlocks(initialContent);
                    if (blocks && blocks.length > 0) {
                        editor.replaceBlocks(editor.document, blocks);
                    }
                    if (id) {
                        await updateDoc(docRef(db, "documents", id), {
                            initialContent: null,
                        });
                    }
                } catch (err) {
                    console.error("Failed to parse initialContent into blocks:", err);
                }
            })();
        }
    }, [editor, initialContent, id]);

    return (
        <div className='relative max-w-6xl mx-auto print:max-w-none print:m-0'>
            <div className='flex items-center gap-2 justify-end mb-6 no-print'>
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100/90 dark:bg-neutral-900/90 border border-neutral-200/80 dark:border-neutral-800/80 backdrop-blur-xs shadow-2xs">
                    <AstroWritingAssistant doc={doc} editor={editor} />
                    <TranslateDocument doc={doc} editor={editor} docId={id} title={title} />
                    <ExportDocument editor={editor} title={title} />
                </div>
            </div>

            {/* Floating Selection Astro AI Toolbar */}
            <AstroSelectionToolbar doc={doc} editor={editor} />

            <BlockNoteView
                className='min-h-screen print:min-h-0 print:p-0'
                editor={editor}
                theme={darkMode ? "dark" : "light"}
            />
        </div>
    )
}

function Editor({ title, id, initialContent }: { title?: string; id?: string; initialContent?: string | null }) {
    const room = useRoom();
    const [doc, setDoc] = useState<Y.Doc>();
    const [provider, setProvider] = useState<LiveblocksYjsProvider>();
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const yDoc = new Y.Doc();
        const yProvider = new LiveblocksYjsProvider(room, yDoc);

        const originalSetLocalStateField = yProvider.awareness.setLocalStateField.bind(yProvider.awareness);
        yProvider.awareness.setLocalStateField = (field, value) => {
            queueMicrotask(() => {
                originalSetLocalStateField(field, value);
            });
        };

        const originalSetLocalState = yProvider.awareness.setLocalState.bind(yProvider.awareness);
        yProvider.awareness.setLocalState = (state) => {
            queueMicrotask(() => {
                originalSetLocalState(state);
            });
        };

        setDoc(yDoc);
        setProvider(yProvider);

        return () => {
            yDoc?.destroy();
            yProvider?.destroy();
        }
    }, [room]);

    if (!doc || !provider) {
        return null;
    }

    const isDarkMode = mounted ? resolvedTheme === "dark" : false;

    return (
        <div className='max-w-6xl mx-auto relative'>
            {/* BlockNote */}
            <BlockNote doc={doc} provider={provider} darkMode={isDarkMode} title={title} id={id || room.id} initialContent={initialContent} />

            {/* Floating Bottom-Right AI Assistant Widget */}
            <ChatToDocument doc={doc} />
        </div>
    )
}

export default Editor;
