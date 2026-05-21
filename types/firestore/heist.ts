import { DocumentData, FieldValue, QueryDocumentSnapshot } from 'firebase/firestore'

// Document — what you read from Firestore (after conversion)
export interface Heist {
  id: string
  title: string
  description: string
  createdBy: string // uid
  createdByCodename: string
  assignedTo: string // uid
  assignedToCodename: string
  createdAt: Date
  deadline: Date
  finalStatus: null | 'success' | 'failure'
}

// Create Input — what you pass to addDoc
export interface CreateHeistInput {
  title: string
  description: string
  createdBy: string // uid
  createdByCodename: string
  assignedTo: string // uid
  assignedToCodename: string
  createdAt: FieldValue // serverTimestamp()
  deadline: FieldValue // serverTimestamp() + 48 hours
  finalStatus: null
}

// Update Input — partial fields for updateDoc (no createdAt)
export interface UpdateHeistInput {
  title?: string
  description?: string
  assignedTo?: string // uid
  assignedToCodename?: string
  deadline?: Date
  finalStatus?: null | 'success' | 'failure'
}

export const heistConverter = {
  toFirestore: (data: Partial<Heist>): DocumentData => data,

  fromFirestore: (snapshot: QueryDocumentSnapshot): Heist => ({
    id: snapshot.id,
    ...snapshot.data(),
    createdAt: snapshot.data().createdAt?.toDate(),
    deadline: snapshot.data().deadline?.toDate(),
  } as Heist),
}
