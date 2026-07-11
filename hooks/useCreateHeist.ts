import { addDoc, collection } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COLLECTIONS, CreateHeistInput } from '@/types/firestore'

export function useCreateHeist() {
  const createHeist = async (input: CreateHeistInput) => {
    const ref = await addDoc(collection(db, COLLECTIONS.HEISTS), input)
    return ref.id
  }

  return { createHeist }
}
