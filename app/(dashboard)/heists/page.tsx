'use client'

import { useHeists } from '@/hooks/useHeists'
import { Heist } from '@/types/firestore/heist'
import { HeistCard } from '@/components/HeistCard'
import { HeistCardSkeleton } from '@/components/HeistCardSkeleton'
import styles from './page.module.css'

export default function HeistsPage() {
  const { heists: activeHeists, loading: activeLoading, error: activeError } = useHeists('active')
  const { heists: assignedHeists, loading: assignedLoading, error: assignedError } = useHeists('assigned')

  const renderHeistSection = (title: string, heists: Heist[], loading: boolean, error: Error | null) => (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {loading ? (
        <div className={styles.grid}>
          {[0, 1, 2].map((i) => (
            <HeistCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      ) : error ? (
        <p className={styles.errorMessage}>Could not load heists. Please refresh.</p>
      ) : heists.length === 0 ? (
        <p className={styles.emptyState}>No heists to display.</p>
      ) : (
        <div className={styles.grid}>
          {heists.map((heist) => (
            <HeistCard key={heist.id} heist={heist} />
          ))}
        </div>
      )}
    </section>
  )

  return (
    <div className="page-content space-y-8">
      {renderHeistSection('Your Active Heists', activeHeists, activeLoading, activeError)}
      {renderHeistSection('Heists You\'ve Assigned', assignedHeists, assignedLoading, assignedError)}
    </div>
  )
}