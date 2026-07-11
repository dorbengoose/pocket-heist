import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export function useCreateUserProfile() {
  const createUserProfile = async (uid: string, codename: string) => {
    await setDoc(doc(db, 'users', uid), {
      codename,
      id: uid,
    })
  }

  return { createUserProfile }
}
