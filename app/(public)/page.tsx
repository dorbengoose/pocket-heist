import { Clock8 } from "lucide-react"
import { AuthRedirect } from "@/components/AuthRedirect"

export default function Home() {
  return (
    <>
      <AuthRedirect />
      <div className="center-content">
        <div className="page-content">
          <h1>
            P<Clock8 className="logo" strokeWidth={2.75} />cket Heist
          </h1>
          <div>Tiny missions. Big office mischief.</div>
          <p>Plan your next covert operation — one sticky note at a time.</p>
        </div>
      </div>
    </>
  )
}
