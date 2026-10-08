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

function Breadcrumbs() {
    const path = usePathname();
    const segments = path.split("/").filter(Boolean);

    const isDocPage = segments[0] === "doc" && segments.length > 1;
    const docId = isDocPage ? segments[1] : "";

    const [data] = useDocumentData(docId ? doc(db, "documents", docId) : null);

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>

                {segments.map((segment, index) => {
                    const href = `/${segments.slice(0, index + 1).join("/")}`;
                    const isLast = index === segments.length - 1;

                    let label = segment;
                    if (isDocPage && index === 1) {
                        label = data?.title || segment;
                    }

                    return (
                        <Fragment key={segment + index}>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage className="max-w-[150px] sm:max-w-[250px] md:max-w-[400px] truncate">
                                        {label}
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}

export default Breadcrumbs;