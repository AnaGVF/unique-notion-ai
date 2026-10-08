'use client'

import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Breadcrumbs from "./Breadcrumbs";
import DarkModeToggle from "./DarkModeToggle";

function Header() {
  const { user } = useUser();

  return (
    <header className="flex items-center justify-between p-4 md:p-5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 transition-colors">
      {user && (
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {user?.firstName}{`'s`} Space
        </h1>
      )}

      <Breadcrumbs />

      <div className="flex items-center gap-3">
        <DarkModeToggle />

        <SignedOut>
          <SignInButton />
        </SignedOut>

        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  )
}
export default Header