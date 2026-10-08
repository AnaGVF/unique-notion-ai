"use client"

import React, { FormEvent, useState, useTransition } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';
import { inviteUserToDocument } from '@/actions/actions';
import { toast } from 'sonner';
import { Input } from './ui/input';
import { Loader2, Mail, ShieldCheck, UserPlus } from 'lucide-react';

function InviteUser({ id }: { id?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [email, setEmail] = useState('');
    const pathname = usePathname();

    const handleInvite = async (e: FormEvent) => {
        e.preventDefault();

        if (!email.trim()) return;

        const roomId = id || pathname.split("/").pop();
        if (!roomId) return;

        startTransition(async () => {
            const { success } = await inviteUserToDocument(roomId, email.trim());

            if (success) {
                setIsOpen(false);
                setEmail("");
                toast.success("User added to the document successfully");
            } else {
                toast.error("Failed to add user to the document");
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Button
                asChild
                variant="outline"
                size="sm"
                className="gap-1.5 h-8 text-xs font-medium border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-2xs"
            >
                <DialogTrigger>
                    <UserPlus className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
                    <span>Invite</span>
                </DialogTrigger>
            </Button>

            <DialogContent className="sm:max-w-md">
                <DialogHeader className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-2xs">
                            <UserPlus className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                                Invite Collaborator
                            </DialogTitle>
                            <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400">
                                Enter the email of the person you want to collaborate with.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form className="space-y-3 pt-2" onSubmit={handleInvite}>
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <Input
                                placeholder="colleague@example.com"
                                type="email"
                                required
                                className="pl-9 h-10 text-xs bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 focus-visible:ring-1 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-600"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={isPending || !email.trim()}
                            className="h-10 px-4 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-800 dark:hover:bg-slate-700 shadow-2xs shrink-0 transition-colors"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                    <span>Inviting...</span>
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                                    <span>Send Invite</span>
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/60 text-[11px] text-neutral-500 dark:text-neutral-400">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
                        <span>Invited users will receive full real-time collaboration privileges to view and edit this document.</span>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default InviteUser;