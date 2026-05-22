import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import Badge from "@/components/Badge"

describe("Badge", () => {
  it("renders successfully with a label prop", () => {
    render(<Badge label="New" />)
    expect(screen.getByText("New")).toBeInTheDocument()
  })

  it("renders with primary variant by default", () => {
    render(<Badge label="Featured" />)
    const badge = screen.getByText("Featured").closest("span")
    expect(badge).toHaveClass("bg-gradient-to-r", "from-purple-600", "to-pink-600", "text-white")
  })

  it("renders with secondary variant when specified", () => {
    render(<Badge label="Inactive" variant="secondary" />)
    const badge = screen.getByText("Inactive").closest("span")
    expect(badge).toHaveClass("bg-gray-200", "text-gray-800")
  })

  it("renders with success variant when specified", () => {
    render(<Badge label="Completed" variant="success" />)
    const badge = screen.getByText("Completed").closest("span")
    expect(badge).toHaveClass("bg-green-100", "text-green-800")
  })
})
