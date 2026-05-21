import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import Navbar from "@/components/Navbar"

vi.mock("@/lib/firebase", () => ({
  auth: {},
}))

vi.mock("firebase/auth", () => ({
  signOut: vi.fn(),
}))

vi.mock("@/context/UserContext", () => ({
  useUser: vi.fn(() => ({ user: null, loading: false })),
}))

describe("Navbar", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the main heading", () => {
    render(<Navbar />)

    const heading = screen.getByRole("heading", { level: 1 })
    expect(heading).toBeInTheDocument()
  })

  it("renders the Create Heist link", () => {
    render(<Navbar />)

    const createLink = screen.getByRole("link", { name: /create heist/i })
    expect(createLink).toBeInTheDocument()
    expect(createLink).toHaveAttribute("href", "/heists/create")
  })

  describe("Logout button", () => {
    it("does not show logout button when user is not logged in", () => {
      render(<Navbar />)

      const logoutButton = screen.queryByRole("button", { name: /sign out/i })
      expect(logoutButton).not.toBeInTheDocument()
    })

    it("shows logout button when user is logged in", async () => {
      const { useUser } = await import("@/context/UserContext")
      vi.mocked(useUser).mockReturnValue({
        user: { uid: "user123" },
        loading: false,
      } as any)

      render(<Navbar />)

      const logoutButton = screen.getByRole("button", { name: /sign out/i })
      expect(logoutButton).toBeInTheDocument()
    })

    it("calls signOut when logout button is clicked", async () => {
      const { useUser } = await import("@/context/UserContext")
      vi.mocked(useUser).mockReturnValue({
        user: { uid: "user123" },
        loading: false,
      } as any)

      const { signOut } = await import("firebase/auth")

      const user = userEvent.setup()
      render(<Navbar />)

      const logoutButton = screen.getByRole("button", { name: /sign out/i })
      await user.click(logoutButton)

      await waitFor(() => {
        expect(signOut).toHaveBeenCalled()
      })
    })

    it("disables logout button while signing out", async () => {
      const { useUser } = await import("@/context/UserContext")
      vi.mocked(useUser).mockReturnValue({
        user: { uid: "user123" },
        loading: false,
      } as any)

      const { signOut } = await import("firebase/auth")
      vi.mocked(signOut).mockImplementation(() => new Promise(() => {}))

      const user = userEvent.setup()
      render(<Navbar />)

      const logoutButton = screen.getByRole("button", { name: /sign out/i })
      await user.click(logoutButton)

      expect(logoutButton).toBeDisabled()
      expect(screen.getByText("Signing out...")).toBeInTheDocument()
    })

    it("shows error message when logout fails", async () => {
      const { useUser } = await import("@/context/UserContext")
      vi.mocked(useUser).mockReturnValue({
        user: { uid: "user123" },
        loading: false,
      } as any)

      const { signOut } = await import("firebase/auth")
      vi.mocked(signOut).mockRejectedValue(new Error("Network error"))

      const user = userEvent.setup()
      render(<Navbar />)

      const logoutButton = screen.getByRole("button", { name: /sign out/i })
      await user.click(logoutButton)

      await waitFor(() => {
        expect(screen.getByText(/Failed to sign out/)).toBeInTheDocument()
      })
    })

    it("shows loading state text while logging out", async () => {
      const { useUser } = await import("@/context/UserContext")
      vi.mocked(useUser).mockReturnValue({
        user: { uid: "user123" },
        loading: false,
      } as any)

      const { signOut } = await import("firebase/auth")
      vi.mocked(signOut).mockImplementation(() => new Promise(() => {}))

      const user = userEvent.setup()
      render(<Navbar />)

      const logoutButton = screen.getByRole("button", { name: /sign out/i })
      await user.click(logoutButton)

      expect(screen.getByText("Signing out...")).toBeInTheDocument()
    })
  })
})
