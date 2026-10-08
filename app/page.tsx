import { ArrowLeftCircle } from "lucide-react";

export default function Home() {
  return (
    <main className="flex space-x-2 items-center animate-pulse text-gray-700 dark:text-gray-300">
      <ArrowLeftCircle className="w-12 h-12" />
      <h1 className="font-bold">
        Get Started with creating a New Document
      </h1>
    </main>
  );
}
