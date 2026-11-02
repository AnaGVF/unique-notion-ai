import RoomProvider from '@/components/RoomProvider'
import React from 'react'

// Authentication is enforced in middleware.ts for all /doc routes, so this layout
// no longer blocks navigation on a server-side auth check.
async function DocLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ id?: string; Id?: string }>;
}) {
    const resolvedParams = await params;
    const roomId = resolvedParams?.id || resolvedParams?.Id || "";
    return <RoomProvider roomId={roomId}>{children}</RoomProvider>
}

export default DocLayout
