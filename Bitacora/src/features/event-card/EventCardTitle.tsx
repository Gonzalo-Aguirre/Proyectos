import styles from "./EventCardTitle.module.css";

interface EventCardTitleProps {
  title: string;
}

/** Span (no heading) para poder usarlo dentro de controles clickeables. */
export function EventCardTitle({ title }: EventCardTitleProps) {
  return <span className={styles.root}>{title}</span>;
}
