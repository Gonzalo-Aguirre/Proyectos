import { PersonChip } from "@/features/chips/PersonChip";
import styles from "./EventCardPeople.module.css";

interface EventCardPeopleProps {
  people: string[];
}

export function EventCardPeople({ people }: EventCardPeopleProps) {
  if (people.length === 0) return null;

  return (
    <div className={styles.root}>
      {people.map((name) => (
        <PersonChip key={name} name={name} />
      ))}
    </div>
  );
}
