'use client'

import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Breadcrumbs from "./Breadcrumbs";
import DarkModeToggle from "./DarkModeToggle";
import { Feather } from "lucide-react";
import Link from "next/link";

function Header() {
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 md:px-6 md:py-3.5 border-b border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md transition-colors shadow-2xs">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          title="Go to Home"
          className="flex items-center gap-2.5 group cursor-pointer transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-800 dark:bg-slate-800 text-white dark:text-slate-100 flex items-center justify-center shadow-xs border border-slate-700/60 group-hover:scale-105 group-hover:bg-slate-700 dark:group-hover:bg-slate-700 transition-all">
            <Feather className="w-4 h-4 text-slate-100 group-hover:-rotate-12 transition-transform duration-300" />
          </div>
          {user && (
            <span className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-100 truncate max-w-[150px] sm:max-w-none group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
              {user?.firstName}{`'s`} Space
            </span>
          )}
        </Link>
      </div>

      <Breadcrumbs />

      <div className="flex items-center gap-2.5">
        <DarkModeToggle />

        <SignedOut>
          <SignInButton />
        </SignedOut>

        <SignedIn>
          <div className="flex items-center justify-center rounded-full ring-2 ring-gray-200 dark:ring-gray-800 p-0.5">
            <UserButton />
          </div>
        </SignedIn>
      </div>
    </header>
  )
}
export default Header
