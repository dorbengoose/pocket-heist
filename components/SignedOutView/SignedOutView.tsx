'use client'

import Link from 'next/link'
import { LogIn } from 'lucide-react'
import styles from './SignedOutView.module.css'

export function SignedOutView() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.heading}>You are signed out</h1>
        <p className={styles.description}>Please log in to access your heists and continue your mission.</p>
        <Link href="/login" className={styles.loginButton}>
          <LogIn size={20} />
          <span>Go to Login</span>
        </Link>
      </div>
    </div>
  )
}
