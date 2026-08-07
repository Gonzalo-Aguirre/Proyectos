import { Plus } from "lucide-react";
import styles from "./AddEventFab.module.css";

interface AddEventFabProps {
  onClick: () => void;
}

export function AddEventFab({ onClick }: AddEventFabProps) {
  return (
    <button
      type="button"
      className={styles.root}
      onClick={onClick}
      aria-label="Agregar evento"
    >
      <Plus size={24} />
    </button>
  );
}
