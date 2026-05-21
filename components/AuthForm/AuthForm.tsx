"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { generateCodename } from "@/lib/generateCodename"
import styles from "./AuthForm.module.css"

interface AuthFormProps {
  mode: "login" | "signup"
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [successCodename, setSuccessCodename] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (mode === "login") {
      // Login stub - unchanged for now
      console.log({ email, password })
      setEmail("")
      setPassword("")
      setShowPassword(false)
      return
    }

    // Signup flow
    try {
      setIsLoading(true)
      setError(null)

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Generate codename
      const codename = generateCodename()

      // Set the codename as the user's displayName
      await updateProfile(userCredential.user, { displayName: codename })

      // Create user profile document in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        codename,
        id: userCredential.user.uid,
      })

      // Show success message and reset form
      setSuccessCodename(codename)
      setEmail("")
      setPassword("")
      setShowPassword(false)

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (err) {
      setIsLoading(false)

      // Type-safe error handling
      const error = err as { code?: string; message?: string }
      let errorMessage = "Something went wrong. Please try again."

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "An account with that email already exists."
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password must be at least 6 characters."
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection and try again."
      }

      setError(errorMessage)
    }
  }

  const submitLabel =
    mode === "login"
      ? isLoading
        ? "Logging in..."
        : "Log In"
      : isLoading
        ? "Signing up..."
        : "Sign Up"

  const switchHref = mode === "login" ? "/signup" : "/login"
  const switchText =
    mode === "login"
      ? "Don't have an account? Sign up"
      : "Already have an account? Log in"

  return (
    <>
      {error && <p className={styles.errorMessage}>{error}</p>}
      {successCodename && (
        <p className={styles.successMessage}>
          Your codename is {successCodename}. Redirecting to login...
        </p>
      )}
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
        <button type="submit" className={styles.submit} disabled={isLoading}>
          {submitLabel}
        </button>
      </form>
      <Link href={switchHref} className={styles.switchLink}>
        {switchText}
      </Link>
    </>
  )
}
