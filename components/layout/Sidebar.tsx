"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Historial" },
  { href: "/grafo", label: "Grafo de correlativas" },
];

export function Sidebar({ studentName }: { studentName?: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex flex-col border-r border-notion-border bg-white transition-all duration-200 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      <div className="flex h-14 items-center gap-2 border-b border-notion-border px-4">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="rounded p-2 hover:bg-gray-100"
          aria-label={collapsed ? "Expandir" : "Colapsar"}
        >
          <svg
            className={`h-5 w-5 transition-transform ${collapsed ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
        {!collapsed && (
          <span className="font-medium text-notion-text">Historial SAS</span>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-gray-100 text-notion-text"
                  : "text-notion-text-secondary hover:bg-gray-50 hover:text-notion-text"
              }`}
            >
              {item.href === "/" ? (
                <ListIcon className="h-4 w-4 shrink-0" />
              ) : (
                <GraphIcon className="h-4 w-4 shrink-0" />
              )}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && studentName && (
        <div className="border-t border-notion-border p-3">
          <p className="truncate text-xs text-notion-text-secondary">
            {studentName}
          </p>
        </div>
      )}
    </aside>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 10h16M4 14h16M4 18h16"
      />
    </svg>
  );
}

function GraphIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    </svg>
  );
}
