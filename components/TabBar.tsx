"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/",
    label: "홈",
    icon: <path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />,
  },
  {
    href: "/tarot",
    label: "타로",
    icon: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="3" />
        <path d="M12 8l1.2 2.8L16 12l-2.8 1.2L12 16l-1.2-2.8L8 12l2.8-1.2z" />
      </>
    ),
  },
  {
    href: "/compat",
    label: "궁합",
    icon: (
      <>
        <circle cx="9" cy="12" r="5" />
        <circle cx="15" cy="12" r="5" />
      </>
    ),
  },
  {
    href: "/love",
    label: "연애운",
    icon: <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />,
  },
];

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="grid h-[76px] grid-cols-4 items-center rounded-t-[26px] bg-white shadow-[0_-6px_20px_rgba(194,37,92,0.08)]">
      {tabs.map((t) => {
        const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-1 text-xs no-underline ${active ? "text-brand" : "text-ink-mute"}`}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill={active ? "#FFE3EC" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {t.icon}
            </svg>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
