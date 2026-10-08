"use client";

import { ChevronDown, ChevronRight, Folder, MenuIcon, Search, Users } from "lucide-react";
import NewDocumentButton from "./NewDocumentButton";
import { useCollection } from "react-firebase-hooks/firestore";
import { useUser } from "@clerk/nextjs";
import { collectionGroup, DocumentData, query, where } from "firebase/firestore";
import { db } from "@/firebase";
import { useEffect, useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import SidebarOption from "./SidebarOption";
import { Input } from "./ui/input";


interface RoomDocument extends DocumentData {
  createdAt: string;
  role: "owner" | "editor";
  roomId: string;
  userId: string;
}

function Sidebar() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMyDocsOpen, setIsMyDocsOpen] = useState(true);
  const [isSharedOpen, setIsSharedOpen] = useState(true);

  const [groupedData, setGroupedData] = useState<{
    owner: RoomDocument[];
    editor: RoomDocument[];
  }>({
    owner: [],
    editor: [],
  });

  const [data] = useCollection(
    user && (
      query(collectionGroup(db, 'rooms'),
        where('userId', '==', user.emailAddresses[0].toString()))
    )
  );

  useEffect(() => {
    if (!data) return;

    const grouped = data.docs.reduce<{
      owner: RoomDocument[];
      editor: RoomDocument[];
    }>(
      (acc, curr) => {
        const roomData = curr.data() as RoomDocument;

        if (roomData.role === "owner") {
          acc.owner.push({
            id: curr.id,
            ...roomData,
          });
        } else {
          acc.editor.push({
            id: curr.id,
            ...roomData,
          });
        }
        return acc;
      }, {
      owner: [],
      editor: [],
    }
    );
    setGroupedData(grouped);
  }, [data]);

  const menuOptions = (
    <div className="flex flex-col gap-4 w-full md:w-56">
      <NewDocumentButton />

      {/* Quick Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
        <Input
          type="text"
          placeholder="Filter docs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 h-9 text-xs bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-lg focus-visible:ring-1"
        />
      </div>

      <div className="flex flex-col space-y-4 overflow-y-auto max-h-[calc(100vh-220px)] scrollbar-hide pr-0.5">
        {/* My Documents Section */}
        <div className="flex flex-col space-y-1">
          <button
            onClick={() => setIsMyDocsOpen(!isMyDocsOpen)}
            className="flex items-center justify-between py-1.5 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900/60 transition-colors cursor-pointer w-full text-left"
          >
            <div className="flex items-center gap-1.5">
              {isMyDocsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              <Folder className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
              <span>My Documents</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-200/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono">
              {groupedData.owner.length}
            </span>
          </button>

          {isMyDocsOpen && (
            <div className="flex flex-col space-y-1 pl-1">
              {groupedData.owner.length === 0 ? (
                <p className="text-xs text-neutral-400 dark:text-neutral-600 italic px-3 py-2">
                  No documents found
                </p>
              ) : (
                groupedData.owner.map((doc) => (
                  <SidebarOption key={doc.id} id={doc.id} href={`/doc/${doc.id}`} searchQuery={searchQuery} />
                ))
              )}
            </div>
          )}
        </div>

        {/* Shared with Me Section */}
        {groupedData.editor.length > 0 && (
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => setIsSharedOpen(!isSharedOpen)}
              className="flex items-center justify-between py-1.5 px-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900/60 transition-colors cursor-pointer w-full text-left"
            >
              <div className="flex items-center gap-1.5">
                {isSharedOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                <Users className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                <span>Shared with Me</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-200/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono">
                {groupedData.editor.length}
              </span>
            </button>

            {isSharedOpen && (
              <div className="flex flex-col space-y-1 pl-1">
                {groupedData.editor.map((doc) => (
                  <SidebarOption key={doc.id} id={doc.id} href={`/doc/${doc.id}`} searchQuery={searchQuery} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <aside className="p-3 md:p-4 bg-gray-50 dark:bg-gray-950 border-r border-gray-200/80 dark:border-gray-800/80 relative transition-colors">
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger className="p-2 hover:bg-gray-200/60 dark:hover:bg-gray-800/60 rounded-lg transition-colors">
            <MenuIcon className="text-gray-800 dark:text-gray-200" size={24} />
          </SheetTrigger>
          <SheetContent side="left" className="bg-gray-50 dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 w-72">
            <SheetHeader className="mb-4">
              <SheetTitle className="text-left text-gray-900 dark:text-gray-100 font-bold">Workspace</SheetTitle>
            </SheetHeader>
            {menuOptions}
          </SheetContent>
        </Sheet>
      </div>
      <div className="hidden md:block">
        {menuOptions}
      </div>
    </aside>
  )
}
export default Sidebar