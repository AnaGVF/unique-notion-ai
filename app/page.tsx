import { Feather } from "lucide-react";
import NewDocumentButton from "@/components/NewDocumentButton";

export default function Home() {
  return (
    <main className="h-full min-h-[65vh] flex flex-col items-center justify-center text-center px-4 select-none">
      <div className="w-16 h-16 rounded-2xl bg-slate-800 text-white flex items-center justify-center shadow-lg mb-5 ring-4 ring-slate-100 dark:ring-slate-900/80 transition-transform hover:scale-105">
        <Feather className="w-8 h-8 text-slate-100 -rotate-12" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 mb-2.5">
        Welcome to your Notion Workspace
      </h1>

      <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md leading-relaxed mb-6">
        Select a document from the sidebar to continue editing, or click below to start a new page with Astro AI.
      </p>

      <div className="w-full max-w-xs">
        <NewDocumentButton />
      </div>
    </main>
  );
}
