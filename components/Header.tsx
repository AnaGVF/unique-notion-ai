'use client'

import { useUser } from "@clerk/nextjs"

function Header() {
  const {user} = useUser();

  return (
    <div>
      {user && (
        <h1></h1>
      )}
    </div>
  )
}
export default Header