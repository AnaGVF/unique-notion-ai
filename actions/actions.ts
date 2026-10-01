'use server'

import { adminDB } from "@/firebase-admin";
import liveblocks from "@/lib/liveblocks";
import { auth } from "@clerk/nextjs/server";

export async function createNewDocument() {
    await auth.protect();

    const { sessionClaims } = await auth();

    const docCollectionRef = adminDB.collection("documents");
    const docRef = await docCollectionRef.add({
        title: "New Doc"
    });

    await adminDB.collection("users").doc(sessionClaims?.email!).collection("rooms").doc(docRef.id).set({
        userId: sessionClaims?.email!,
        role: "owner",
        created: new Date(),
        roomId: docRef.id,
    });

    return { docId: docRef.id };
}

export async function deleteDocument(roomId: string) {
    await auth.protect(); // Ensure the user is authenticated
    const { sessionClaims } = await auth();

    console.log("deleteDocument", roomId);

    try {
        // delete the document reference itself
        await adminDB.collection("documents").doc(roomId).delete();

        try {
            const query = await adminDB
                .collectionGroup("rooms")
                .where("roomId", "==", roomId)
                .get();

            const batch = adminDB.batch();

            // delete the room reference in the user's collection for every user in the room
            query.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });

            await batch.commit();
        } catch (firestoreError) {
            console.warn("Collection group query failed (may need Firestore index), falling back to deleting current user's room:", firestoreError);
            if (sessionClaims?.email) {
                await adminDB
                    .collection("users")
                    .doc(sessionClaims.email)
                    .collection("rooms")
                    .doc(roomId)
                    .delete();
            }
        }

        // Delete room in Liveblocks (ignore if room was already deleted / doesn't exist on Liveblocks)
        try {
            await liveblocks.deleteRoom(roomId);
        } catch (liveblocksError) {
            console.warn("Liveblocks deleteRoom note:", liveblocksError);
        }

        return { success: true };
    } catch (error) {
        console.error("Error in deleteDocument:", error);
        return { success: false };
    }
}

export async function inviteUserToDocument(roomId: string, email: string) {
    await auth.protect(); // Ensure the user is authenticated

    console.log("inviteUserToDocument", roomId, email);

    try {
        await adminDB
            .collection("users")
            .doc(email)
            .collection("rooms")
            .doc(roomId)
            .set({
                userId: email,
                role: "editor",
                created: new Date(),
                roomId,
            });

        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
}

export async function removeUserFromDocument(roomId: string, email: string) {
    await auth.protect(); // Ensure the user is authenticated

    console.log("removeUserFromDocument", roomId, email);

    try {
        await adminDB
            .collection("users")
            .doc(email)
            .collection("rooms")
            .doc(roomId)
            .delete();

        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
}