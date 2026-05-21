import Link from 'next/link'
import { Heist } from '@/types/firestore/heist'
import styles from './HeistCard.module.css'

interface HeistCardProps {
  heist: Heist
}

export default function HeistCard({ heist }: HeistCardProps) {
  const formatDeadline = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadgeClass = () => {
    if (heist.finalStatus === null) return styles.badgeActive
    if (heist.finalStatus === 'success') return styles.badgeSuccess
    return styles.badgeFailure
  }

  const getStatusText = () => {
    if (heist.finalStatus === null) return 'Active'
    if (heist.finalStatus === 'success') return 'Success'
    return 'Failed'
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Link href={`/heists/${heist.id}`} className={styles.title}>
          {heist.title}
        </Link>
        <span className={`${styles.badge} ${getStatusBadgeClass()}`}>
          {getStatusText()}
        </span>
      </div>

      {heist.description && (
        <p className={styles.description}>{heist.description}</p>
      )}

      <div className={styles.metadata}>
        <div className={styles.metadataRow}>
          <span className={styles.metadataLabel}>Created by</span>
          <span className={styles.metadataValue}>{heist.createdByCodename}</span>
        </div>
        <div className={styles.metadataRow}>
          <span className={styles.metadataLabel}>Assigned to</span>
          <span className={styles.metadataValue}>{heist.assignedToCodename}</span>
        </div>
        <div className={styles.metadataRow}>
          <span className={styles.metadataLabel}>Deadline</span>
          <span className={styles.metadataValue}>{formatDeadline(heist.deadline)}</span>
        </div>
      </div>

      <Link href={`/heists/${heist.id}`} className={styles.button}>
        View Details
      </Link>
    </div>
  )
}
