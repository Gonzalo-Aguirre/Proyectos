import { TagPill } from "@/features/chips/TagPill";
import styles from "./EventCardTags.module.css";

interface EventCardTagsProps {
  tags: string[];
}

export function EventCardTags({ tags }: EventCardTagsProps) {
  if (tags.length === 0) return null;

  return (
    <div className={styles.root}>
      {tags.map((tag) => (
        <TagPill key={tag} label={tag} />
      ))}
    </div>
  );
}
