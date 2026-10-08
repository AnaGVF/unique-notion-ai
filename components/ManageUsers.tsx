"use client"

import React, { useState, useTransition } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from './ui/button';
import { removeUserFromDocument } from '@/actions/actions';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';
import { useOthers, useRoom, useSelf } from '@liveblocks/react';
import useOwner from '@/lib/useOwner';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collectionGroup, query, where } from 'firebase/firestore';
import { db } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Trash2, Users } from 'lucide-react';
import stringToColor from '@/lib/stringToColor';

function ManageUsers() {
    const { user } = useUser();
    const room = useRoom();
    const isOwner = useOwner();
    const self = useSelf();
    const others = useOthers();
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const [usersInRoom] = useCollection(
        user && query(collectionGroup(db, "rooms"), where("roomId", "==", room.id))
    );

    const handleDelete = async (userId: string) => {
        startTransition(async () => {
            if (!user) return;

            const { success } = await removeUserFromDocument(room.id, userId);

            if (success) {
                toast.success("User removed from Room successfully!");
            } else {
                toast.error("Failed to remove user from Room.")
            }
        })
    };

    const getUserAvatar = (userId: string) => {
        if (userId === user?.emailAddresses[0]?.toString()) {
            return user?.imageUrl || self?.info?.avatar;
        }
        const found = others.find((other) => other?.info?.email === userId);
        return found?.info?.avatar;
    };

    const getUserName = (userId: string) => {
        if (userId === user?.emailAddresses[0]?.toString()) {
            return user?.fullName || user?.firstName || "You";
        }
        const found = others.find((other) => other?.info?.email === userId);
        return found?.info?.name;
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Button asChild variant="outline" size="sm" className="gap-1.5 h-8">
                <DialogTrigger>
                    <Users className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
                    <span>Users ({usersInRoom?.docs.length ?? 0})</span>
                </DialogTrigger>
            </Button>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Users with Access</DialogTitle>
                    <DialogDescription>
                        Below is a list of users who have access to this document.
                    </DialogDescription>
                </DialogHeader>

                <hr className="my-2 border-neutral-200 dark:border-neutral-800" />

                <div className='flex flex-col space-y-2.5 max-h-72 overflow-y-auto pr-1'>
                    {usersInRoom?.docs.map((doc) => {
                        const userId = doc.data().userId;
                        const role = doc.data().role;
                        const isCurrentUser = userId === user?.emailAddresses[0]?.toString();
                        const avatarUrl = getUserAvatar(userId);
                        const displayName = getUserName(userId);
                        const userColor = stringToColor(userId || "user");

                        return (
                            <div
                                key={userId}
                                className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/60 transition-colors"
                            >
                                <div className="flex items-center gap-3 min-w-0 pr-2">
                                    <Avatar className="w-8 h-8 ring-2 ring-neutral-200/80 dark:ring-neutral-800 shrink-0">
                                        <AvatarImage src={avatarUrl} />
                                        <AvatarFallback
                                            style={{ backgroundColor: userColor }}
                                            className="text-white text-xs font-bold"
                                        >
                                            {userId?.slice(0, 2).toUpperCase() || "US"}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex flex-col min-w-0">
                                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                                            {isCurrentUser ? `You (${userId})` : userId}
                                        </p>
                                        {displayName && displayName !== "You" && displayName !== userId && (
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                                                {displayName}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className='flex items-center gap-2 shrink-0'>
                                    {role === "owner" ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/80 shadow-2xs">
                                            <Crown className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                            <span>owner</span>
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-200/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300/60 dark:border-neutral-700/60">
                                            editor
                                        </span>
                                    )}

                                    {isOwner && !isCurrentUser && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-100/60 dark:hover:bg-red-950/50"
                                            onClick={() => handleDelete(userId)}
                                            disabled={isPending}
                                            title="Remove user"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ManageUsers