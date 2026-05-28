"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Student } from "@/types/historial";
import { titleCase } from "@/components/malla/helpers";

const NAV = [
  {
    href: "/",
    label: "Inicio",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.5 7 L8 2.5 L13.5 7 V13.5 H2.5 Z" />
        <path d="M6.5 13.5 V9.5 H9.5 V13.5" />
      </svg>
    ),
  },
  {
    href: "/carrer-roadmap",
    label: "Plan de estudios",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2.5" y="3" width="11" height="10" rx="1.2" />
        <path d="M2.5 6.5 H13.5 M6 3 V13 M10 3 V13" />
      </svg>
    ),
  },
];

export function AppSidebar({ student }: { student: Student }) {
  const pathname = usePathname();

  const nameParts = titleCase(student.nombre).split(" ");
  const initials =
    nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
      : nameParts[0].slice(0, 2).toUpperCase();
  const shortName =
    nameParts.length >= 2
      ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`
      : nameParts[0];

  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-mark">
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 4 L20 19 L4 19 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="12" cy="4" r="1.6" fill="#b8542a" />
            <circle cx="20" cy="19" r="1.4" fill="#2b2418" />
            <circle cx="4" cy="19" r="1.4" fill="#2b2418" />
          </svg>
        </div>
        <div>
          <div className="brand-name">facultad·sas</div>
          <div className="brand-sub">PORTAL ACADÉMICO</div>
        </div>
      </div>

      <nav className="sidenav" aria-label="Navegación principal">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidenav-item ${pathname === item.href ? "on" : ""}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidenav-footer">
        <div className="avatar">{initials}</div>
        <div>
          <div className="avatar-name">{shortName}</div>
          <div className="avatar-meta">LU {student.lu}</div>
        </div>
      </div>
    </aside>
  );
}
