import styles from "./TagPill.module.css";

interface TagPillProps {
  label: string;
}

export function TagPill({ label }: TagPillProps) {
  return <span className={styles.root}>{label}</span>;
}
