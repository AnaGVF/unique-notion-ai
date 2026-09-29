'use client'

import Document from "@/components/Document";
import { use } from "react";

function DocumentPage({
    params,
}: {
    params: Promise<{
        Id?: string;
        id?: string;
    }>;
}) {
    const resolvedParams = use(params);
    const id = resolvedParams.Id || resolvedParams.id || "";

    return (
        <div className="flex flex-col flex-1 min-h-screen">
            <Document id={id} />
        </div>
    );
}

export default DocumentPage;