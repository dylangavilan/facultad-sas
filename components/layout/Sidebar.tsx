"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Historial", description: "Resumen de materias" },
  {
    href: "/carrer-roadmap",
    label: "Malla curricular",
    description: "Plan de estudios interactivo",
  },
];

export function Sidebar({ studentName }: { studentName?: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex flex-col border-r border-slate-900 bg-[#070b13]/85 backdrop-blur-xl text-slate-200 transition-all duration-300 shrink-0 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex h-16 items-center gap-2 border-b border-slate-900/60 px-4">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800/40 hover:text-slate-100 transition-colors"
          aria-label={collapsed ? "Expandir navegación" : "Colapsar navegación"}
        >
          <svg
            className={`h-5 w-5 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
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
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-400 to-blue-600 text-xs font-bold text-white shadow-lg shadow-blue-500/10">
              FS
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-tight tracking-wide bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                Facultad SAS
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                Panel Académico
              </span>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1.5 px-3 py-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3.5 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-slate-800/40 text-sky-400 border-l-2 border-sky-500 shadow-[inset_0_0_12px_rgba(56,189,248,0.03)]"
                  : "text-slate-400 hover:bg-slate-800/20 hover:text-slate-200 border-l-2 border-transparent"
              }`}
            >
              {item.href === "/" ? (
                <ListIcon
                  className={`h-4.5 w-4.5 shrink-0 ${
                    isActive ? "text-sky-400" : "text-slate-500 group-hover:text-sky-400 transition-colors"
                  }`}
                />
              ) : (
                <GraphIcon
                  className={`h-4.5 w-4.5 shrink-0 ${
                    isActive ? "text-sky-400" : "text-slate-500 group-hover:text-sky-400 transition-colors"
                  }`}
                />
              )}
              {!collapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold leading-normal truncate">{item.label}</span>
                  {item.description && (
                    <span className="text-[10px] text-slate-500 truncate leading-none mt-0.5">
                      {item.description}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {!collapsed && studentName && (
        <div className="border-t border-slate-900/60 p-4">
          <div className="rounded-xl bg-slate-950/30 border border-slate-900/80 px-3.5 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Alumno
            </p>
            <p className="mt-1 truncate text-xs font-semibold text-slate-300">
              {studentName}
            </p>
          </div>
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
