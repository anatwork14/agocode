import type { ReactNode } from "react";

type MarginNoteProps = {
  label?: string;
  children: ReactNode;
};

export function MarginNote({ label = "Note", children }: MarginNoteProps) {
  return (
    <aside className="margin-note">
      <span className="margin-note__label">{label}</span>
      {children}
    </aside>
  );
}
