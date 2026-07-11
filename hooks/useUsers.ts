import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COLLECTIONS } from '@/types/firestore'

export function useUsers() {
  const [users, setUsers] = useState<Array<{ id: string; codename: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const usersSnapshot = await getDocs(collection(db, COLLECTIONS.USERS))
        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          codename: doc.data().codename,
        }))
        setUsers(usersData)
        setError(null)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  return { users, loading, error }
}
