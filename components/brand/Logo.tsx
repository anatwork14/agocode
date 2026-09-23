import Link from "next/link";

type LogoMarkProps = {
  size?: number;
  className?: string;
};

export function LogoMark({ size = 38, className }: LogoMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
    >
      <path
        d="M10 54 27.2 13.5c1.7-4 7.9-4 9.6 0L54 54"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M21 39h22" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="21" cy="39" r="3.5" fill="var(--paper)" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="32" cy="39" r="4" fill="var(--accent)" />
      <circle cx="43" cy="39" r="3.5" fill="var(--paper)" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}

export function BrandLockup() {
  return (
    <Link className="brand-lockup" href="/" aria-label="AgoCode home">
      <LogoMark />
      <span className="brand-lockup__name">
        Ago<strong>Code</strong>
      </span>
    </Link>
  );
}
