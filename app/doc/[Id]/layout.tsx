import RoomProvider from '@/components/RoomProvider'
import { auth } from '@clerk/nextjs/server'
import React from 'react'

async function DocLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ id?: string; Id?: string }>;
}) {
    await auth.protect();
    const resolvedParams = await params;
    const roomId = resolvedParams?.id || resolvedParams?.Id || "";
    return <RoomProvider roomId={roomId}>{children}</RoomProvider>
}

export default DocLayout