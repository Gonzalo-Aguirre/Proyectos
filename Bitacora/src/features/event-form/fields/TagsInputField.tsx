"use client";

import { useState } from "react";
import styles from "./field.module.css";
import chipStyles from "./TagsInputField.module.css";

interface TagsInputFieldProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  hint?: string;
}

export function TagsInputField({
  label,
  values,
  onChange,
  placeholder,
  hint,
}: TagsInputFieldProps) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const next = draft.trim();
    if (!next) return;
    if (!values.includes(next)) {
      onChange([...values, next]);
    }
    setDraft("");
  };

  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      <div className={chipStyles.box}>
        <div className={chipStyles.chips}>
          {values.map((value) => (
            <button
              key={value}
              type="button"
              className={chipStyles.chip}
              onClick={() => onChange(values.filter((item) => item !== value))}
              title="Quitar"
            >
              {value} ×
            </button>
          ))}
        </div>
        <input
          className={chipStyles.input}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              commit();
            }
          }}
          onBlur={commit}
          placeholder={placeholder}
        />
      </div>
      {hint ? <span className={styles.hint}>{hint}</span> : null}
    </div>
  );
}
