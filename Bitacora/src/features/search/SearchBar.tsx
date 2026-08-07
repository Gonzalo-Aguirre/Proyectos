import { Search } from "lucide-react";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Buscar por título, descripción o personas…",
}: SearchBarProps) {
  return (
    <div className={styles.root}>
      <Search className={styles.icon} size={18} aria-hidden />
      <label className="srOnly" htmlFor="event-search">
        Buscar eventos
      </label>
      <input
        id="event-search"
        className={styles.input}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
