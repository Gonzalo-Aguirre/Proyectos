import styles from "./EventCardTitle.module.css";

interface EventCardTitleProps {
  title: string;
  variant?: "compact" | "expanded";
}

/** Span (no heading) para poder usarlo dentro de controles clickeables. */
export function EventCardTitle({
  title,
  variant = "compact",
}: EventCardTitleProps) {
  return (
    <span
      className={variant === "expanded" ? styles.expanded : styles.compact}
      title={title}
    >
      {title}
    </span>
  );
}
