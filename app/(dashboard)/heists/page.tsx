'use client'

import { useHeists } from '@/hooks/useHeists'

export default function HeistsPage() {
  const { heists: activeHeists, loading: activeLoading } = useHeists('active')
  const { heists: assignedHeists, loading: assignedLoading } = useHeists('assigned')
  const { heists: expiredHeists, loading: expiredLoading } = useHeists('expired')

  return (
    <div className="page-content">
      <div className="active-heists">
        <h2>Your Active Heists</h2>
        {activeLoading ? (
          <p>Loading...</p>
        ) : activeHeists.length === 0 ? (
          <p>No active heists yet.</p>
        ) : (
          <ul>
            {activeHeists.map((heist) => (
              <li key={heist.id}>{heist.title}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="assigned-heists">
        <h2>Heists You've Assigned</h2>
        {assignedLoading ? (
          <p>Loading...</p>
        ) : assignedHeists.length === 0 ? (
          <p>No assigned heists yet.</p>
        ) : (
          <ul>
            {assignedHeists.map((heist) => (
              <li key={heist.id}>{heist.title}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="expired-heists">
        <h2>All Expired Heists</h2>
        {expiredLoading ? (
          <p>Loading...</p>
        ) : expiredHeists.length === 0 ? (
          <p>No expired heists yet.</p>
        ) : (
          <ul>
            {expiredHeists.map((heist) => (
              <li key={heist.id}>{heist.title}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}