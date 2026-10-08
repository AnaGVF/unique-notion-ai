'use client'

import { FormEvent, useEffect, useState, useTransition } from 'react'
import { Input } from './ui/input';
import { Button } from './ui/button';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useDocumentData } from 'react-firebase-hooks/firestore';

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
    const [input, setInput] = useState('')
    const [isUpdating, startTransition] = useTransition();
    const isOwner = useOwner();

    useEffect(() => {
        if (data) {
            setInput(data.title);
        }
    }, [data]);

    const updateTitle = (e: FormEvent) => {
        e.preventDefault();

        if (input.trim()) {
            startTransition(async () => {
                await updateDoc(doc(db, "documents", id), {
                    title: input,
                });
            });
        }
    }

    if (loading || !data) {
        return <LoadingSpinner />;
    }

    return (
        <div className='flex-1 h-full bg-white dark:bg-gray-950 p-5 rounded-lg shadow-xs border border-gray-200 dark:border-gray-800 transition-colors'>
            <div className='flex max-w-6xl mx-auto justify-between pb-5'>
                <form className='flex flex-1 space-x-2' onSubmit={updateTitle}>
                    {/* update title... */}
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="bg-white dark:bg-gray-900 font-semibold"
                    />

                    <Button disabled={isUpdating} type='submit'>
                        {isUpdating ? 'Updating...' : 'Update'}
                    </Button>

                    {isOwner && (
                        <>
                            <InviteUser />
                            <DeleteDocument id={id} />
                        </>
                    )}
                </form>
            </div>

            <div className='flex max-w-6xl mx-auto justify-between items-center mb-5'>
                <ManageUsers />

                <Avatars />
            </div>

            <hr className='pb-10 border-gray-200 dark:border-gray-800' />

            <Editor />

        </div>
    );
}

export default Document;