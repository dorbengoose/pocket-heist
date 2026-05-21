import styles from './HeistCardSkeleton.module.css'

export default function HeistCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.skeletonBlock} style={{ width: '70%', height: '24px' }} />
        <div className={styles.skeletonBlock} style={{ width: '70px', height: '24px' }} />
      </div>

      <div className={styles.skeletonBlock} style={{ width: '100%', height: '40px' }} />

      <div className={styles.metadata}>
        <div className={styles.skeletonBlock} style={{ width: '100%', height: '16px' }} />
        <div className={styles.skeletonBlock} style={{ width: '100%', height: '16px' }} />
        <div className={styles.skeletonBlock} style={{ width: '100%', height: '16px' }} />
      </div>

      <div className={styles.skeletonBlock} style={{ width: '100%', height: '40px' }} />
    </div>
  )
}
