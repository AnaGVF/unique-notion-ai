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
import { deleteDocument, moveToTrash } from '@/actions/actions';
import { toast } from 'sonner';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';

function DeleteDocument({ id, isTrash = false }: { id?: string; isTrash?: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const pathname = usePathname();
    const router = useRouter();

    const handleDelete = async () => {
        const roomId = id || pathname.split("/").pop();

        if (!roomId) return;

        startTransition(async () => {
            if (isTrash) {
                // Permanent deletion
                const { success } = await deleteDocument(roomId);
                if (success) {
                    setIsOpen(false);
                    router.replace("/");
                    toast.success("Document permanently deleted");
                } else {
                    toast.error("Failed to permanently delete document");
                }
            } else {
                // Move to trash
                const { success } = await moveToTrash(roomId);
                if (success) {
                    setIsOpen(false);
                    router.replace("/");
                    toast.success("Document moved to Trash");
                } else {
                    toast.error("Failed to move document to Trash");
                }
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
                    <span>{isTrash ? "Delete Forever" : "Trash"}</span>
                </DialogTrigger>
            </Button>

            <DialogContent className="sm:max-w-md">
                <DialogHeader className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-gray-900 dark:text-gray-100">
                                {isTrash ? "Permanently Delete Document?" : "Move Document to Trash?"}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500 dark:text-gray-400">
                                {isTrash
                                    ? "This action is irreversible. All content, comments, and collaborative history will be lost."
                                    : "This will move the document to the Trash. You can restore it anytime from the sidebar."}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200/80 dark:border-red-900/40 p-3 my-1">
                    <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed font-medium">
                        {isTrash
                            ? "Are you sure you want to completely erase this document from Firebase and Liveblocks?"
                            : "You can view and restore trashed documents at any time from the Trash folder in the sidebar."}
                    </p>
                </div>

                <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs h-8"
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        disabled={isPending}
                        className="text-xs h-8 gap-1.5 shadow-2xs"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>{isTrash ? "Deleting..." : "Moving..."}</span>
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>{isTrash ? "Delete Permanently" : "Move to Trash"}</span>
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default DeleteDocument;
