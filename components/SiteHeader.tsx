import Link from "next/link";
import { BrandLockup } from "@/components/brand/Logo";

const links = [
  ["Book", "/learn"],
  ["Syllabus", "/syllabus"],
  ["Lab", "/lab"],
  ["Problems", "/exercises"],
  ["Solve", "/solve"],
  ["Ways", "/blog"],
  ["Practice", "/practice/next"],
  ["Sets", "/sets"],
  ["Review", "/review"],
  ["Progress", "/progress"],
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-shell site-header__inner">
        <BrandLockup />
        <nav className="primary-nav" aria-label="Primary navigation">
          {links.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <Link className="mobile-nav" href="/practice/next">
          Practice →
        </Link>
      </div>
    </header>
  );
}
