'use client'

import { usePathname } from "next/navigation";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { doc } from "firebase/firestore";
import { db } from "@/firebase";

import { HomeIcon } from "lucide-react";

function Breadcrumbs() {
    const path = usePathname();
    const segments = path.split("/").filter(Boolean);

    const isDocPage = segments[0] === "doc" && segments.length > 1;
    const docId = isDocPage ? segments[1] : "";

    const [data] = useDocumentData(docId ? doc(db, "documents", docId) : null);

    return (
        <Breadcrumb className="hidden sm:inline-block">
            <BreadcrumbList className="px-3 py-1.5 rounded-full bg-neutral-100/90 dark:bg-neutral-900/90 border border-neutral-200/80 dark:border-neutral-800/80 text-xs sm:text-sm backdrop-blur-xs shadow-2xs">
                <BreadcrumbItem>
                    <BreadcrumbLink href="/" className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                        <HomeIcon className="w-3.5 h-3.5" />
                        <span>Home</span>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                {isDocPage ? (
                    <>
                        <BreadcrumbSeparator className="text-neutral-400 dark:text-neutral-600" />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="font-medium text-neutral-900 dark:text-neutral-100 max-w-[160px] md:max-w-[320px] truncate">
                                <span className="truncate">{data?.title || "Untitled"}</span>
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </>
                ) : (
                    segments.map((segment, index) => {
                        const href = `/${segments.slice(0, index + 1).join("/")}`;
                        const isLast = index === segments.length - 1;

                        return (
                            <Fragment key={segment + index}>
                                <BreadcrumbSeparator className="text-neutral-400 dark:text-neutral-600" />
                                <BreadcrumbItem>
                                    {isLast ? (
                                        <BreadcrumbPage className="font-medium text-neutral-900 dark:text-neutral-100 truncate capitalize">
                                            {segment}
                                        </BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink href={href} className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors capitalize">
                                            {segment}
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                            </Fragment>
                        );
                    })
                )}
            </BreadcrumbList>
        </Breadcrumb>
    );
}

export default Breadcrumbs;