import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="h-full min-h-[60vh] flex flex-col items-center justify-center text-center px-4 select-none">
      <div className="w-14 h-14 rounded-2xl bg-slate-800 text-white flex items-center justify-center shadow-md mb-4 ring-4 ring-slate-100 dark:ring-slate-900/60">
        <Sparkles className="w-7 h-7 text-slate-200" />
      </div>

      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mb-2">
        Welcome to your Notion Workspace
      </h1>

      <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md leading-relaxed">
        Select a document from the sidebar to continue editing, or click <span className="font-semibold text-neutral-700 dark:text-neutral-300">New Document</span> in the sidebar to create one.
      </p>
    </main>
  );
}
