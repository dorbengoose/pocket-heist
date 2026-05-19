import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"
import AuthForm from "@/components/AuthForm"

describe("AuthForm", () => {
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
})
