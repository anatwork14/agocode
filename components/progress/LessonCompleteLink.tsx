"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type LessonCompleteLinkProps = {
  storageKey: string;
  lessonId: string;
  href: string;
  children: ReactNode;
  className?: string;
};

export function LessonCompleteLink({
  storageKey,
  lessonId,
  href,
  children,
  className = "button button--primary",
}: LessonCompleteLinkProps) {
  return (
    <Link
      className={className}
      href={href}
      onClick={() => {
        localStorage.setItem(
          storageKey,
          JSON.stringify({ completedAt: new Date().toISOString(), exerciseId: lessonId }),
        );
      }}
    >
      {children}
    </Link>
  );
}
