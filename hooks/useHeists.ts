import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useUser } from '@/context/UserContext'
import { COLLECTIONS, Heist, heistConverter } from '@/types/firestore'

type HeistFilter = 'active' | 'assigned' | 'expired'

export function useHeists(filter: HeistFilter) {
  const { user } = useUser()
  const [heists, setHeists] = useState<Heist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const heistsRef = collection(db, COLLECTIONS.HEISTS).withConverter(heistConverter)

    // Guard: if user-dependent filters and no user, return empty immediately
    if ((filter === 'active' || filter === 'assigned') && !user) {
      setHeists([])
      setLoading(false)
      return
    }

    const now = new Date()
    let q

    if (filter === 'active') {
      q = query(heistsRef, where('assignedTo', '==', user!.uid))
    } else if (filter === 'assigned') {
      q = query(heistsRef, where('createdBy', '==', user!.uid))
    } else {
      // 'expired'
      q = query(heistsRef, where('deadline', '<=', Timestamp.fromDate(now)))
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const now = new Date()
        const allHeists = snapshot.docs.map((doc) => doc.data()) as Heist[]

        // Apply client-side filter based on filter type
        let filtered: Heist[]
        if (filter === 'expired') {
          filtered = allHeists.filter((h) => h.finalStatus !== null)
        } else {
          // 'active' or 'assigned': filter by deadline
          filtered = allHeists.filter((h) => h.deadline > now)
        }

        setHeists(filtered)
        setError(null)
        setLoading(false)
      },
      (err: Error) => {
        setError(err)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [filter, user?.uid])

  return { heists, loading, error }
}
