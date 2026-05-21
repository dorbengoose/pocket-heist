'use client'

import { useState } from 'react'
import { Clock8, LogOut } from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useUser } from '@/context/UserContext'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user } = useUser()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      setError(null)
      await signOut(auth)
    } catch (err) {
      setError('Failed to sign out. Please try again.')
      setIsLoggingOut(false)
    }
  }

  return (
    <div className={styles.siteNav}>
      <nav>
        <header>
          <h1>
            <Link href="/heists">
              P<Clock8 className={styles.logo} size={14} strokeWidth={2.75} />
              cket Heist
            </Link>
          </h1>
          <div>Tiny missions. Big office mischief.</div>
        </header>
        <ul>
          <li>
            <Link href="/heists/create">Create Heist</Link>
          </li>
          {user && (
            <li className={styles.logoutItem}>
              {error && <span className={styles.logoutError}>{error}</span>}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={styles.logoutButton}
                aria-label="Sign out"
              >
                <LogOut size={18} />
                <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
              </button>
            </li>
          )}
        </ul>
      </nav>
    </div>
  )
}
