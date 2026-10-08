'use client';

import { useTransition } from "react";
import { Button } from "./ui/button"
import { useRouter } from "next/navigation";
import { createNewDocument } from "@/actions/actions";
import { PlusCircle, Loader2 } from "lucide-react";

function NewDocumentButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCreateNewDocument = () => {
    startTransition(async() => {
      const { docId } = await createNewDocument();
      router.push(`/doc/${docId}`);
    });
  };

  return (
    <Button 
      onClick={handleCreateNewDocument} 
      disabled={isPending}
      className="w-full bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 font-medium shadow-xs hover:shadow-sm border border-slate-700/60 dark:border-slate-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 h-9 rounded-lg text-xs sm:text-sm cursor-pointer"
    >
      {isPending ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Creating...</span>
        </>
      ) : (
        <>
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Document</span>
        </>
      )}
    </Button>
  )
}
export default NewDocumentButton