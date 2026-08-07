import styles from "./EventCardDescription.module.css";

interface EventCardDescriptionProps {
  description: string;
}

export function EventCardDescription({ description }: EventCardDescriptionProps) {
  return <p className={styles.root}>{description}</p>;
}
