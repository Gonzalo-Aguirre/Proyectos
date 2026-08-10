import type { TimelineFilter } from "@/types/event";
import { FilterButton } from "./FilterButton";
import styles from "./FilterBar.module.css";

const FILTERS: { id: TimelineFilter; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "actividades", label: "Actividades" },
  { id: "retos_abiertos", label: "Retos abiertos" },
  { id: "retos_resueltos", label: "Retos resueltos" },
];

interface FilterBarProps {
  value: TimelineFilter;
  onChange: (value: TimelineFilter) => void;
}

export function FilterBar({ value, onChange }: FilterBarProps) {
  return (
    <div className={styles.root} role="toolbar" aria-label="Filtros de eventos">
      {FILTERS.map((filter) => (
        <FilterButton
          key={filter.id}
          label={filter.label}
          active={value === filter.id}
          onClick={() => onChange(filter.id)}
        />
      ))}
    </div>
  );
}
