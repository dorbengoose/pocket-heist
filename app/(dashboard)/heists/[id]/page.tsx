'use client'

import { useParams } from 'next/navigation'
import { useHeistById } from '@/hooks/useHeistById'
import styles from './page.module.css'

export default function HeistDetailsPage() {
  const params = useParams()
  const heistId = params?.id as string | null
  const { heist, loading, error } = useHeistById(heistId)

  const calculateTimeLeft = (deadline: Date) => {
    const now = new Date()
    const diffMs = deadline.getTime() - now.getTime()

    if (diffMs <= 0) return 'Time expired'

    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`
    }
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  }

  if (loading) {
    return (
      <div className="page-content">
        <div className={styles.skeleton}>Loading heist details...</div>
      </div>
    )
  }

  if (error || !heist) {
    return (
      <div className="page-content">
        <div className={styles.error}>
          {error?.message || 'Heist not found'}
        </div>
      </div>
    )
  }

  const getStatusBadge = () => {
    if (heist.finalStatus === null) return { text: 'Active', className: styles.statusActive }
    if (heist.finalStatus === 'success') return { text: 'Success', className: styles.statusSuccess }
    return { text: 'Failed', className: styles.statusFailure }
  }

  const status = getStatusBadge()

  return (
    <div className="page-content">
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{heist.title}</h1>
            <span className={`${styles.badge} ${status.className}`}>
              {status.text}
            </span>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.mainContent}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Details</h2>
              <p className={styles.description}>{heist.description}</p>
            </section>
          </div>

          <div className={styles.sidebar}>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Information</h3>
              <div className={styles.infoBlock}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Created by:</span>
                  <span className={styles.value}>{heist.createdByCodename}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Assigned to:</span>
                  <span className={styles.value}>{heist.assignedToCodename}</span>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Timeline</h3>
              <div className={styles.infoBlock}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Created:</span>
                  <span className={styles.value}>
                    {heist.createdAt.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Deadline:</span>
                  <span className={styles.value}>
                    {heist.deadline.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className={`${styles.infoRow} ${styles.timeLeft}`}>
                  <span className={styles.label}>Time left:</span>
                  <span className={styles.value}>{calculateTimeLeft(heist.deadline)}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}