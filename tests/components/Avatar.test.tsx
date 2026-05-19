import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import Avatar from "@/components/Avatar"

describe("Avatar", () => {
  it("renders successfully with a name prop", () => {
    render(<Avatar name="Alice" />)
    const avatar = screen.getByRole("img", { hidden: true })
    expect(avatar).toBeInTheDocument()
  })

  it("displays the first letter for lowercase names", () => {
    render(<Avatar name="bob" />)
    expect(screen.getByText("B")).toBeInTheDocument()
  })

  it("displays the first two uppercase letters for PascalCase names", () => {
    render(<Avatar name="JohnDoe" />)
    expect(screen.getByText("JD")).toBeInTheDocument()
  })
})
