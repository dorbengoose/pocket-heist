import styles from "./Avatar.module.css"

interface AvatarProps {
  name: string
}

export default function Avatar({ name }: AvatarProps) {
  const getInitials = (name: string): string => {
    const trimmed = name.trim()
    if (!trimmed) return "?"

    const uppercase = trimmed.match(/[A-Z]/g) || []

    if (uppercase.length >= 2) {
      return uppercase.slice(0, 2).join("")
    }

    return trimmed[0].toUpperCase()
  }

  const initials = getInitials(name)

  return (
    <div className={styles.avatar} role="img" aria-label={`Avatar for ${name}`}>
      {initials}
    </div>
  )
}
