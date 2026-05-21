import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import AuthForm from "@/components/AuthForm"

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}))

vi.mock("@/lib/firebase", () => ({
  auth: {},
  db: {},
}))

vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
}))

vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
}))

vi.mock("@/lib/generateCodename", () => ({
  generateCodename: vi.fn(() => "SilentBlackFox"),
}))

describe("AuthForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders email input, password input, and submit button", () => {
    render(<AuthForm mode="login" />)
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Log In" })).toBeInTheDocument()
  })

  it("uses 'Log In' as the submit label in login mode", () => {
    render(<AuthForm mode="login" />)
    expect(screen.getByRole("button", { name: "Log In" })).toBeInTheDocument()
  })

  it("uses 'Sign Up' as the submit label in signup mode", () => {
    render(<AuthForm mode="signup" />)
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument()
  })

  it("masks the password field by default", () => {
    render(<AuthForm mode="login" />)
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password")
  })

  it("toggles password visibility when the icon is clicked", async () => {
    const user = userEvent.setup()
    render(<AuthForm mode="login" />)
    const password = screen.getByLabelText("Password")

    await user.click(screen.getByRole("button", { name: "Show password" }))
    expect(password).toHaveAttribute("type", "text")

    await user.click(screen.getByRole("button", { name: "Hide password" }))
    expect(password).toHaveAttribute("type", "password")
  })

  it("logs entered values and clears fields on submit", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {})
    const user = userEvent.setup()
    render(<AuthForm mode="login" />)

    const email = screen.getByLabelText("Email") as HTMLInputElement
    const password = screen.getByLabelText("Password") as HTMLInputElement

    await user.type(email, "user@example.com")
    await user.type(password, "secret123")
    await user.click(screen.getByRole("button", { name: "Log In" }))

    expect(logSpy).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "secret123",
    })
    expect(email.value).toBe("")
    expect(password.value).toBe("")

    logSpy.mockRestore()
  })

  it("links to /signup in login mode", () => {
    render(<AuthForm mode="login" />)
    const link = screen.getByRole("link", { name: /sign up/i })
    expect(link).toHaveAttribute("href", "/signup")
  })

  it("links to /login in signup mode", () => {
    render(<AuthForm mode="signup" />)
    const link = screen.getByRole("link", { name: /log in/i })
    expect(link).toHaveAttribute("href", "/login")
  })

  describe("Signup mode with Firebase", () => {
    it("disables submit button while loading", async () => {
      const { createUserWithEmailAndPassword } = await import("firebase/auth")
      const neverResolvesPromise = new Promise(() => {})
      vi.mocked(createUserWithEmailAndPassword).mockReturnValue(neverResolvesPromise as any)

      const user = userEvent.setup()
      render(<AuthForm mode="signup" />)

      await user.type(screen.getByLabelText("Email"), "user@example.com")
      await user.type(screen.getByLabelText("Password"), "password123")
      await user.click(screen.getByRole("button", { name: "Sign Up" }))

      expect(screen.getByRole("button", { name: "Signing up..." })).toBeDisabled()
    })

    it("changes submit button label to 'Signing up...' while loading", async () => {
      const { createUserWithEmailAndPassword } = await import("firebase/auth")
      vi.mocked(createUserWithEmailAndPassword).mockReturnValue(
        new Promise(() => {}) as any
      )

      const user = userEvent.setup()
      render(<AuthForm mode="signup" />)

      await user.type(screen.getByLabelText("Email"), "user@example.com")
      await user.type(screen.getByLabelText("Password"), "password123")
      await user.click(screen.getByRole("button", { name: "Sign Up" }))

      expect(screen.getByRole("button", { name: "Signing up..." })).toBeInTheDocument()
    })

    it("shows error message for email-already-in-use", async () => {
      const { createUserWithEmailAndPassword } = await import("firebase/auth")
      vi.mocked(createUserWithEmailAndPassword).mockRejectedValue({
        code: "auth/email-already-in-use",
      })

      const user = userEvent.setup()
      render(<AuthForm mode="signup" />)

      await user.type(screen.getByLabelText("Email"), "taken@example.com")
      await user.type(screen.getByLabelText("Password"), "password123")
      await user.click(screen.getByRole("button", { name: "Sign Up" }))

      await waitFor(() => {
        expect(screen.getByText(/An account with that email already exists/)).toBeInTheDocument()
      })
    })

    it("shows error message for weak-password", async () => {
      const { createUserWithEmailAndPassword } = await import("firebase/auth")
      vi.mocked(createUserWithEmailAndPassword).mockRejectedValue({
        code: "auth/weak-password",
      })

      const user = userEvent.setup()
      render(<AuthForm mode="signup" />)

      await user.type(screen.getByLabelText("Email"), "user@example.com")
      await user.type(screen.getByLabelText("Password"), "short")
      await user.click(screen.getByRole("button", { name: "Sign Up" }))

      await waitFor(() => {
        expect(
          screen.getByText(/Password must be at least 6 characters/)
        ).toBeInTheDocument()
      })
    })

    it("shows error message for network-request-failed", async () => {
      const { createUserWithEmailAndPassword } = await import("firebase/auth")
      vi.mocked(createUserWithEmailAndPassword).mockRejectedValue({
        code: "auth/network-request-failed",
      })

      const user = userEvent.setup()
      render(<AuthForm mode="signup" />)

      await user.type(screen.getByLabelText("Email"), "user@example.com")
      await user.type(screen.getByLabelText("Password"), "password123")
      await user.click(screen.getByRole("button", { name: "Sign Up" }))

      await waitFor(() => {
        expect(
          screen.getByText(/Network error. Please check your connection/)
        ).toBeInTheDocument()
      })
    })

    it("shows fallback error message for unknown error code", async () => {
      const { createUserWithEmailAndPassword } = await import("firebase/auth")
      vi.mocked(createUserWithEmailAndPassword).mockRejectedValue({
        code: "auth/unknown-error",
      })

      const user = userEvent.setup()
      render(<AuthForm mode="signup" />)

      await user.type(screen.getByLabelText("Email"), "user@example.com")
      await user.type(screen.getByLabelText("Password"), "password123")
      await user.click(screen.getByRole("button", { name: "Sign Up" }))

      await waitFor(() => {
        expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()
      })
    })

    it("calls createUserWithEmailAndPassword with email and password", async () => {
      const { createUserWithEmailAndPassword } = await import("firebase/auth")
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
        user: { uid: "user123" },
      } as any)
      const { updateProfile } = await import("firebase/auth")
      vi.mocked(updateProfile).mockResolvedValue(undefined)
      const { setDoc } = await import("firebase/firestore")
      vi.mocked(setDoc).mockResolvedValue(undefined)

      const user = userEvent.setup()
      render(<AuthForm mode="signup" />)

      await user.type(screen.getByLabelText("Email"), "test@example.com")
      await user.type(screen.getByLabelText("Password"), "password123")
      await user.click(screen.getByRole("button", { name: "Sign Up" }))

      await waitFor(() => {
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), "test@example.com", "password123")
      })
    })

    it("calls updateProfile with generated codename as displayName", async () => {
      const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth")
      const mockUser = { uid: "user123" }
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
        user: mockUser,
      } as any)
      vi.mocked(updateProfile).mockResolvedValue(undefined)
      const { setDoc } = await import("firebase/firestore")
      vi.mocked(setDoc).mockResolvedValue(undefined)

      const user = userEvent.setup()
      render(<AuthForm mode="signup" />)

      await user.type(screen.getByLabelText("Email"), "test@example.com")
      await user.type(screen.getByLabelText("Password"), "password123")
      await user.click(screen.getByRole("button", { name: "Sign Up" }))

      await waitFor(() => {
        expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName: "SilentBlackFox" })
      })
    })

    it("creates Firestore document with codename and id (no email)", async () => {
      const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth")
      const mockUser = { uid: "user456" }
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
        user: mockUser,
      } as any)
      vi.mocked(updateProfile).mockResolvedValue(undefined)
      const { doc, setDoc } = await import("firebase/firestore")
      vi.mocked(doc).mockReturnValue({} as any)
      vi.mocked(setDoc).mockResolvedValue(undefined)

      const user = userEvent.setup()
      render(<AuthForm mode="signup" />)

      await user.type(screen.getByLabelText("Email"), "test@example.com")
      await user.type(screen.getByLabelText("Password"), "password123")
      await user.click(screen.getByRole("button", { name: "Sign Up" }))

      await waitFor(() => {
        expect(setDoc).toHaveBeenCalled()
        // Verify the data passed to setDoc has codename and id, not email
        const callArgs = vi.mocked(setDoc).mock.calls[0][1] as Record<string, unknown>
        expect(callArgs).toEqual({
          codename: "SilentBlackFox",
          id: "user456",
        })
        expect(callArgs).not.toHaveProperty("email")
      })
    })

    it("shows success banner with codename after successful signup", async () => {
      const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth")
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
        user: { uid: "user123" },
      } as any)
      vi.mocked(updateProfile).mockResolvedValue(undefined)
      const { setDoc } = await import("firebase/firestore")
      vi.mocked(setDoc).mockResolvedValue(undefined)

      const user = userEvent.setup()
      render(<AuthForm mode="signup" />)

      await user.type(screen.getByLabelText("Email"), "test@example.com")
      await user.type(screen.getByLabelText("Password"), "password123")
      await user.click(screen.getByRole("button", { name: "Sign Up" }))

      await waitFor(() => {
        expect(screen.getByText(/Your codename is SilentBlackFox/)).toBeInTheDocument()
      })
    })

    it("clears form fields after successful signup", async () => {
      const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth")
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
        user: { uid: "user123" },
      } as any)
      vi.mocked(updateProfile).mockResolvedValue(undefined)
      const { setDoc } = await import("firebase/firestore")
      vi.mocked(setDoc).mockResolvedValue(undefined)

      const user = userEvent.setup()
      render(<AuthForm mode="signup" />)

      const emailInput = screen.getByLabelText("Email") as HTMLInputElement
      const passwordInput = screen.getByLabelText("Password") as HTMLInputElement

      await user.type(emailInput, "test@example.com")
      await user.type(passwordInput, "password123")
      await user.click(screen.getByRole("button", { name: "Sign Up" }))

      await waitFor(() => {
        expect(emailInput.value).toBe("")
        expect(passwordInput.value).toBe("")
      })
    })

    it("redirects to /login after successful signup", async () => {
      const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth")
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
        user: { uid: "user123" },
      } as any)
      vi.mocked(updateProfile).mockResolvedValue(undefined)
      const { doc, setDoc } = await import("firebase/firestore")
      vi.mocked(doc).mockReturnValue({} as any)
      vi.mocked(setDoc).mockResolvedValue(undefined)

      const { useRouter } = await import("next/navigation")
      const mockPush = vi.fn()
      vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any)

      const user = userEvent.setup()
      render(<AuthForm mode="signup" />)

      await user.type(screen.getByLabelText("Email"), "test@example.com")
      await user.type(screen.getByLabelText("Password"), "password123")
      await user.click(screen.getByRole("button", { name: "Sign Up" }))

      // Wait for success message and redirect call (the setTimeout has a 2000ms delay)
      await waitFor(
        () => {
          expect(mockPush).toHaveBeenCalledWith("/login")
        },
        { timeout: 3000 }
      )
    })
  })
})
