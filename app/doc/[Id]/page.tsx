'use client'

import Document from "@/components/Document";

function DocumentPage({
    params: { Id },
}: {
    params: {
        Id: string;
    };
}) {
    return <div className="flex flex-col flex-1 min-h-screen">
        <Document id={Id} />
    </div>;
}

export default DocumentPage;