'use client'

import { db } from '@/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { FileText } from 'lucide-react';

function SidebarOption({ href, id, searchQuery }: {
    href: string;
    id: string;
    searchQuery?: string;
}) {
    const { user } = useUser();
    const [data, loading] = useDocumentData(doc(db, "documents", id));
    const pathname = usePathname();
    const isActive = href.includes(pathname) && pathname !== "/";

    // Auto-cleanup orphaned room reference if underlying document was deleted
    useEffect(() => {
        if (!loading && data === undefined && user?.emailAddresses[0]?.toString()) {
            deleteDoc(doc(db, "users", user.emailAddresses[0].toString(), "rooms", id));
        }
    }, [data, loading, user, id]);

    if (loading) {
        return (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-gray-100/50 dark:bg-gray-900/40 animate-pulse">
                <div className="w-4 h-4 rounded bg-gray-300/70 dark:bg-gray-700/70 shrink-0" />
                <div className="h-3.5 w-24 rounded bg-gray-300/70 dark:bg-gray-700/70" />
            </div>
        );
    }

    if (!data) return null;

    if (searchQuery && !data.title?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return null;
    }

    return (
        <Link
            href={href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all group ${
                isActive
                    ? "bg-neutral-200/80 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 font-medium border border-neutral-300/50 dark:border-neutral-700/50 shadow-2xs"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-100 border border-transparent"
            }`}
        >
            <FileText className={`w-4 h-4 shrink-0 transition-colors ${
                isActive ? "text-neutral-800 dark:text-neutral-200" : "text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300"
            }`} />
            <span className='truncate'>{data.title || "Untitled"}</span>
        </Link>
    )
}

export default SidebarOption 