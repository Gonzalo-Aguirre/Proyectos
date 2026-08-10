"use client";

import { displayTagLabel, resolveTagHref } from "@/lib/tags/tag-kind";
import styles from "./TagPill.module.css";

interface TagPillProps {
  label: string;
}

export function TagPill({ label }: TagPillProps) {
  const href = resolveTagHref(label);
  const text = displayTagLabel(label);
  const title = label.trim();

  if (href) {
    return (
      <a
        className={`${styles.root} ${styles.link}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={title}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        {text}
      </a>
    );
  }

  return (
    <span className={styles.root} title={title}>
      {text}
    </span>
  );
}
