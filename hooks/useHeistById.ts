import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COLLECTIONS, Heist, heistConverter } from '@/types/firestore'

export function useHeistById(heistId: string | null) {
  const [heist, setHeist] = useState<Heist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!heistId) {
      setHeist(null)
      setLoading(false)
      return
    }

    const heistRef = doc(db, COLLECTIONS.HEISTS, heistId).withConverter(heistConverter)

    const unsubscribe = onSnapshot(
      heistRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setHeist(snapshot.data() as Heist)
          setError(null)
        } else {
          setHeist(null)
          setError(new Error('Heist not found'))
        }
        setLoading(false)
      },
      (err: Error) => {
        setError(err)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [heistId])

  return { heist, loading, error }
}
