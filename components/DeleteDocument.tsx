"use client"

import React, { useState, useTransition } from 'react'
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
import { usePathname, useRouter } from 'next/navigation';
import { deleteDocument } from '@/actions/actions';
import { toast } from 'sonner';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';

function DeleteDocument({ id }: { id?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const pathname = usePathname();
    const router = useRouter();

    const handleDelete = async () => {
        const roomId = id || pathname.split("/").pop();

        if (!roomId) return;

        startTransition(async () => {
            const { success } = await deleteDocument(roomId);

            if (success) {
                setIsOpen(false);
                router.replace("/");
                toast.success("Document deleted successfully");
            } else {
                toast.error("Failed to delete document");
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Button
                asChild
                variant="outline"
                size="sm"
                className="gap-1.5 h-8 text-xs font-medium text-red-600 dark:text-red-400 border-red-200 dark:border-red-950/60 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-700 dark:hover:text-red-300 transition-colors shadow-2xs"
            >
                <DialogTrigger>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                </DialogTrigger>
            </Button>

            <DialogContent className="sm:max-w-md">
                <DialogHeader className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shadow-2xs">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                                Delete Document
                            </DialogTitle>
                            <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400">
                                This action is permanent and cannot be undone.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="text-xs text-neutral-600 dark:text-neutral-300 py-1 leading-relaxed">
                    Are you sure you want to permanently delete this document and revoke access for all collaborators?
                </div>

                <DialogFooter className="sm:justify-end gap-2 pt-2">
                    <DialogClose asChild>
                        <Button type="button" variant="outline" size="sm" className="text-xs">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        disabled={isPending}
                        className="text-xs gap-1.5"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Deleting...</span>
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Document</span>
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default DeleteDocument;