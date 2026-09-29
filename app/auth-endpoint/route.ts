import { auth } from "@clerk/nextjs/server";
import { adminDB } from "@/firebase-admin";
import { NextRequest } from "next/server";
import liveblocks from "@/lib/liveblocks";

export async function POST(req: NextRequest) {
    await auth.protect(); // Ensure the user is authenticated

    const { sessionClaims } = await auth();
    const { room } = await req.json();

    const email = sessionClaims?.email as string;
    const name = (sessionClaims?.fullName || sessionClaims?.firstName || email || "Anonymous") as string;
    const avatar = (sessionClaims?.image || sessionClaims?.imageUrl || "") as string;

    const session = liveblocks.prepareSession(email, {
        userInfo: {
            name,
            email,
            avatar,
        },
    });

    const usersInRoom = await adminDB
        .collectionGroup('rooms')
        .where('userId', '==', email)
        .get();

    const userInRoom = usersInRoom.docs.find((doc) => doc.id === room);

    if (userInRoom?.exists) {
        console.log(`[AUTH-ENDPOINT] User ${email} is authorized for room ${room}`);
        session.allow(room, session.FULL_ACCESS);

        const { body, status } = await session.authorize();
        return new Response(body, { status });
    } else {
        console.log(`[AUTH-ENDPOINT] User ${email} is NOT authorized for room ${room}`);
        return new Response("Unauthorized to access this room", { status: 403 });
    }
}