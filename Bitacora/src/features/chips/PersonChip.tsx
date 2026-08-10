import styles from "./PersonChip.module.css";

interface PersonChipProps {
  name: string;
}

export function PersonChip({ name }: PersonChipProps) {
  return (
    <span className={styles.root} title={name}>
      {name}
    </span>
  );
}
