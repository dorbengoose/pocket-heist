'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/context/UserContext'

export function AuthRedirect() {
  const router = useRouter()
  const { user, loading } = useUser()

  useEffect(() => {
    // Don't redirect while auth state is loading
    if (loading) return

    // Redirect based on auth state
    if (user) {
      // User is logged in, go to heists
      router.push('/heists')
    } else {
      // User is not logged in, go to login
      router.push('/login')
    }
  }, [user, loading, router])

  // Show nothing while determining where to redirect
  return null
}
