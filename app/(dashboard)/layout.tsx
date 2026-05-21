'use client'

import { useUser } from "@/context/UserContext"
import Navbar from "@/components/Navbar"
import { SignedOutView } from "@/components/SignedOutView"

export default function HeistsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user, loading } = useUser()

  // Show nothing while loading auth state
  if (loading) {
    return null
  }

  // Show signed out view if user is not authenticated
  if (!user) {
    return <SignedOutView />
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  )
}
