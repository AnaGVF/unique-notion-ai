'use client'

import { db } from "@/firebase";
import { useUser } from "@clerk/nextjs";
import { useRoom } from "@liveblocks/react/suspense";
import { doc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";

function useOwner() {
    const { user } = useUser();
    const room = useRoom();
    const [isOwner, setIsOwner] = useState(false);

    const userEmail = user?.emailAddresses[0]?.toString();
    const [data] = useDocumentData(
        userEmail && room?.id ? doc(db, "users", userEmail, "rooms", room.id) : null
    );

    useEffect(() => {
        if (data?.role === "owner") {
            setIsOwner(true);
        } else {
            setIsOwner(false);
        }
    }, [data]);

    return isOwner;
}

export default useOwner;
