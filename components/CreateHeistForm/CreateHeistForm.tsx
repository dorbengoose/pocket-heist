'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { serverTimestamp, Timestamp } from 'firebase/firestore'
import { useUser } from '@/context/UserContext'
import { useUsers } from '@/hooks/useUsers'
import { useCreateHeist } from '@/hooks/useCreateHeist'
import { CreateHeistInput } from '@/types/firestore'
import styles from './CreateHeistForm.module.css'

export default function CreateHeistForm() {
  const router = useRouter()
  const { user } = useUser()

  // Form input fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [assigneeCodename, setAssigneeCodename] = useState('')

  // Users collection data
  const { users, loading: isLoadingUsers, error: usersError } = useUsers()
  const { createHeist } = useCreateHeist()

  // Form submission state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (usersError) {
      console.error('Failed to load users:', usersError)
      setError('Failed to load agents. Please refresh the page.')
    }
  }, [usersError])

  // Calculate deadline for display (48 hours from now)
  const deadlinePreview = new Date(Date.now() + 48 * 60 * 60 * 1000).toLocaleString()

  // Handle assignee selection
  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value
    setAssigneeId(selectedId)

    if (selectedId) {
      const selectedUser = users.find((u) => u.id === selectedId)
      setAssigneeCodename(selectedUser?.codename || '')
    } else {
      setAssigneeCodename('')
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (title.trim() === '') {
      setError('Title is required.')
      return
    }

    if (description.trim() === '') {
      setError('Description is required.')
      return
    }

    if (assigneeId === '') {
      setError('Please select an agent to assign this heist to.')
      return
    }

    try {
      setIsLoading(true)

      // Build CreateHeistInput
      const heistData: CreateHeistInput = {
        title: title.trim(),
        description: description.trim(),
        createdBy: user!.uid,
        createdByCodename: user!.displayName ?? 'Unknown Agent',
        assignedTo: assigneeId,
        assignedToCodename: assigneeCodename,
        createdAt: serverTimestamp(),
        deadline: Timestamp.fromDate(new Date(Date.now() + 48 * 60 * 60 * 1000)),
        finalStatus: null,
      }

      // Create document in Firestore
      await createHeist(heistData)

      // Redirect to heists page
      router.push('/heists')
    } catch (err) {
      console.error('Failed to create heist:', err)
      setIsLoading(false)
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <>
      {error && <p className={styles.errorMessage}>{error}</p>}

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Title field */}
        <div className={styles.field}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Office Coffee Heist"
          />
        </div>

        {/* Description field */}
        <div className={styles.field}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            className={`${styles.input} ${styles.textarea}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your mission in detail..."
          />
        </div>

        {/* Created By (read-only) */}
        <div className={styles.field}>
          <label htmlFor="createdBy">Created By</label>
          <div id="createdBy" className={styles.readOnlyField}>
            {user?.displayName || 'Unknown Agent'}
          </div>
        </div>

        {/* Assign To (dropdown) */}
        <div className={styles.field}>
          <label htmlFor="assignee">Assign To</label>
          <select
            id="assignee"
            className={`${styles.input} ${styles.select}`}
            value={assigneeId}
            onChange={handleAssigneeChange}
            disabled={isLoadingUsers}
          >
            <option value="">
              {isLoadingUsers ? 'Loading agents...' : 'Select an agent'}
            </option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.codename}
              </option>
            ))}
          </select>
        </div>

        {/* Deadline (read-only) */}
        <div className={styles.field}>
          <label htmlFor="deadline">Deadline</label>
          <div id="deadline" className={styles.readOnlyField}>
            {deadlinePreview}
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className={styles.submit}
          disabled={isLoading}
        >
          {isLoading ? 'Creating Heist...' : 'Create Heist'}
        </button>
      </form>
    </>
  )
}
