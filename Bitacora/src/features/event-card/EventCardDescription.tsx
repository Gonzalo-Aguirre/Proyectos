import styles from "./EventCardDescription.module.css";

interface EventCardDescriptionProps {
  description: string;
  /** Si se omite, muestra el texto completo. */
  clamp?: number;
  showLabel?: boolean;
  /** compact = grilla; expanded = estilo anterior completo */
  variant?: "compact" | "expanded";
}

export function EventCardDescription({
  description,
  clamp,
  showLabel = true,
  variant = "compact",
}: EventCardDescriptionProps) {
  return (
    <div
      className={
        variant === "expanded" ? styles.sectionExpanded : styles.sectionCompact
      }
    >
      {showLabel ? <h3 className={styles.label}>Descripción</h3> : null}
      <p
        className={variant === "expanded" ? styles.bodyExpanded : styles.bodyCompact}
        style={
          clamp
            ? {
                display: "-webkit-box",
                WebkitLineClamp: clamp,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
            : undefined
        }
      >
        {description}
      </p>
    </div>
  );
}
