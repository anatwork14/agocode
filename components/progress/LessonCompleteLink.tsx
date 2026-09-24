"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { recordLearningAttempt } from "@/lib/learning/evidence";

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
        recordLearningAttempt(localStorage, storageKey, {
          exerciseId: lessonId,
          passed: true,
          passedCount: 1,
          totalTests: 1,
          hintCount: 0,
          runtimeError: false,
        });
      }}
    >
      {children}
    </Link>
  );
}
