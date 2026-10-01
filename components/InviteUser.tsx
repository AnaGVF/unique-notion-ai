"use client"

import React, { FormEvent, useState } from 'react'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from './ui/button';
import { useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { deleteDocument, inviteUserToDocument } from '@/actions/actions';
import { toast } from 'sonner';
import { Input } from './ui/input';

function InviteUser({ id }: { id?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [email, setEmail] = useState('');
    const pathname = usePathname();
    const router = useRouter();

    const handleInvite = async (e: FormEvent) => {
        e.preventDefault();

        const roomId = id || pathname.split("/").pop();
        if (!roomId) return;

        startTransition(async () => {
            const { success } = await inviteUserToDocument(roomId, email);

            if (success) {
                setIsOpen(false);
                setEmail("");
                toast.success("User added to the Room successfully");
            } else {
                toast.error("Failed to add user to the Room");
            }
        })
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Button asChild variant="outline">
                <DialogTrigger>Invite</DialogTrigger>
            </Button>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite a user to collaborate!</DialogTitle>
                    <DialogDescription>
                        Enter the email of the user you want to invite.
                    </DialogDescription>
                </DialogHeader>

                <form className='flex gap-2' onSubmit={handleInvite}>
                    <Input
                        placeholder='Email'
                        type='email'
                        className='w-full'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button type='submit' disabled={isPending}>
                        {isPending ? 'Inviting...' : 'Send Invite'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default InviteUser