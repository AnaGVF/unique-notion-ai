"use client"

import { useRoom } from '@liveblocks/react/suspense';
import * as Y from "yjs";
import React, { useEffect, useState } from 'react'
import { LiveblocksYjsProvider } from '@liveblocks/yjs'
import { Button } from './ui/button';
import { MoonIcon, SunIcon } from 'lucide-react';
import { BlockNoteView } from "@blocknote/shadcn";
import { useCreateBlockNote } from "@blocknote/react";
import { withCollaboration } from "@blocknote/core/yjs";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import { useSelf } from '@liveblocks/react';
import stringToColor from '@/lib/stringToColor';
import TranslateDocument from './TranslateDocument';
import ChatToDocument from './ChatToDocument';
import { useTheme } from 'next-themes';

type EditorProps = {
    doc: Y.Doc;
    provider: LiveblocksYjsProvider;
    darkMode: boolean;
};

function BlockNote({ doc, provider, darkMode }: EditorProps) {
    const userInfo = useSelf((me) => me.info);

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

    return (
        <div className='relative max-w-6xl mx-auto'>
            <BlockNoteView
                className='min-h-screen'
                editor={editor}
                theme={darkMode ? "dark" : "light"}
            />
        </div>
    )
}

function Editor() {
    const room = useRoom();
    const [doc, setDoc] = useState<Y.Doc>();
    const [provider, setProvider] = useState<LiveblocksYjsProvider>();
    const { resolvedTheme, setTheme } = useTheme();
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
        <div className='max-w-6xl mx-auto'>
            <div className='flex items-center gap-2 justify-end mb-10'>
                <TranslateDocument doc={doc} />
                <ChatToDocument doc={doc} />

                {/* Dark Mode */}
                <Button
                    variant="outline"
                    onClick={() => setTheme(isDarkMode ? "light" : "dark")}
                    aria-label="Toggle dark mode"
                >
                    {isDarkMode ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
                </Button>
            </div>
            {/* BlockNote */}
            <BlockNote doc={doc} provider={provider} darkMode={isDarkMode} />
        </div>
    )
}

export default Editor