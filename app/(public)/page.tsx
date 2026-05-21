'use client'

import { Clock8 } from 'lucide-react'
import Link from 'next/link'
import styles from './welcome.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
        {/* Animated background elements */}
        <div className={styles.floatingShapes}>
          <div className={`${styles.shape} ${styles.shape1}`}></div>
          <div className={`${styles.shape} ${styles.shape2}`}></div>
          <div className={`${styles.shape} ${styles.shape3}`}></div>
        </div>

        <main className={styles.main}>
          {/* Mission Briefing Section */}
          <div className={styles.briefing}>
            <div className={styles.briefingHeader}>
              <span className={styles.briefingLabel}>MISSION BRIEFING</span>
              <div className={styles.missionDivider}></div>
            </div>

            {/* Hero Content */}
            <div className={styles.heroContent}>
              <div className={styles.logoSection}>
                <div className={styles.clockContainer}>
                  <Clock8 className={styles.clockIcon} strokeWidth={2.75} />
                </div>
                <h1 className={styles.title}>
                  Pocket<br />Heist
                </h1>
              </div>

              <div className={styles.taglineSection}>
                <h2 className={styles.tagline}>Tiny missions.</h2>
                <h2 className={styles.taglineAccent}>Big office mischief.</h2>
              </div>

              <p className={styles.description}>
                Plan your next covert operation—one sticky note at a time. Coordinate with your team, assign missions, and pull off the perfect heist. No locks to pick. No alarms to disable. Just pure office chaos.
              </p>

              <div className={styles.features}>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>🎯</span>
                  <span>Create sneaky missions</span>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>👥</span>
                  <span>Assign teammates</span>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>⏰</span>
                  <span>48-hour missions</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className={styles.ctaContainer}>
              <Link href="/signup" className={styles.registerButton}>
                <span>Begin Your First Heist</span>
                <span className={styles.arrow}>→</span>
              </Link>
              <Link href="/login" className={styles.loginLink}>
                Already have an account? Sign in
              </Link>
            </div>
          </div>

          {/* Bottom accent */}
          <div className={styles.bottomAccent}></div>
        </main>
      </div>
    )
}
