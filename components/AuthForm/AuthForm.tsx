"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import styles from "./AuthForm.module.css"

interface AuthFormProps {
  mode: "login" | "signup"
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log({ email, password })
    setEmail("")
    setPassword("")
    setShowPassword(false)
  }

  const submitLabel = mode === "login" ? "Log In" : "Sign Up"
  const switchHref = mode === "login" ? "/signup" : "/login"
  const switchText =
    mode === "login"
      ? "Don't have an account? Sign up"
      : "Already have an account? Log in"

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            type="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="auth-password">Password</label>
          <div className={styles.passwordWrapper}>
            <input
              id="auth-password"
              type={showPassword ? "text" : "password"}
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className={styles.toggleButton}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <button type="submit" className={styles.submit}>
          {submitLabel}
        </button>
      </form>
      <Link href={switchHref} className={styles.switchLink}>
        {switchText}
      </Link>
    </>
  )
}
