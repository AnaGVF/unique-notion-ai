'use client'

import { db } from '@/firebase';
import { doc } from 'firebase/firestore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDocumentData } from 'react-firebase-hooks/firestore';

function SidebarOption({ href, id }: {
    href: string;
    id: string;
}) {
    const [data] = useDocumentData(doc(db, "documents", id));
    const pathname = usePathname();
    const isActive = href.includes(pathname) && pathname !== "/";

    if (!data) return null;

    return (
        <Link
            href={href}
            className={`border p-2 rounded-md transition-colors block ${
                isActive
                    ? "bg-gray-300 dark:bg-gray-800 font-bold border-gray-600 dark:border-gray-500 text-gray-900 dark:text-gray-100"
                    : "border-gray-400 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300/50 dark:hover:bg-gray-800/50"
            }`}
        >
            <p className='truncate'>{data.title}</p>
        </Link>
    )
}

export default SidebarOption 