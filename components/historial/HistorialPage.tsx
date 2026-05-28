"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import type { Materia } from "@/types/historial";
import type { Student } from "@/types/historial";
import {
  APPROVED_STATUSES,
  STATUS_META,
  titleCase,
  shortCode,
  bucketOf,
  computeStats,
  type MateriaWithFlags,
  type Bucket,
} from "@/components/malla/helpers";
import type { Situacion } from "@/types/historial";

// ── helpers ──────────────────────────────────────────────────────────────────

const YEAR_ORDER = [
  "PRIMER_AÑO", "SEGUNDO_AÑO", "TERCER_AÑO",
  "CUARTO_AÑO", "QUINTO_AÑO", "OPTATIVAS", "ANEXO",
] as const;

const YEAR_LABELS: Record<string, string> = {
  PRIMER_AÑO: "Primer año", SEGUNDO_AÑO: "Segundo año", TERCER_AÑO: "Tercer año",
  CUARTO_AÑO: "Cuarto año", QUINTO_AÑO: "Quinto año", OPTATIVAS: "Optativas", ANEXO: "Anexo",
};

function buildHistorialGroups(materias: MateriaWithFlags[]) {
  return YEAR_ORDER
    .map((año) => {
      const items = materias.filter((m) => m.año === año);
      if (!items.length) return null;
      const c1 = items.filter((m) => m.cuatrimestre === 1);
      const c2 = items.filter((m) => m.cuatrimestre === 2);
      return { año, label: YEAR_LABELS[año], items, c1, c2 };
    })
    .filter(Boolean) as { año: string; label: string; items: MateriaWithFlags[]; c1: MateriaWithFlags[]; c2: MateriaWithFlags[] }[];
}

// ── StatusIcon ────────────────────────────────────────────────────────────────

function StatusIcon({ bucket, situacion }: { bucket: Bucket; situacion: Situacion }) {
  const glyph: Record<Bucket, React.ReactNode> = {
    done: (
      <svg viewBox="0 0 16 16" width="11" height="11">
        <path d="M3.5 8.5 L7 12 L13 4.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    active: situacion === "A_FINAL" ? (
      <svg viewBox="0 0 16 16" width="11" height="11">
        <path d="M8 3 V9 M8 12 V12.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    ) : situacion === "RECURSA" ? (
      <svg viewBox="0 0 16 16" width="11" height="11">
        <path d="M12 5 A4 4 0 1 0 13 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M10 3 L13 5 L11 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ) : (
      <svg viewBox="0 0 16 16" width="11" height="11">
        <circle cx="8" cy="8" r="2.5" fill="currentColor" />
      </svg>
    ),
    available: (
      <svg viewBox="0 0 16 16" width="11" height="11">
        <path d="M3 4 H7 a2 2 0 0 1 2 2 V13 a2 2 0 0 0 -2 -2 H3 Z M13 4 H9 a2 2 0 0 0 -2 2 V13 a2 2 0 0 1 2 -2 H13 Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    ),
    blocked: (
      <svg viewBox="0 0 16 16" width="11" height="11">
        <rect x="3.5" y="7.5" width="9" height="6" rx="1.2" fill="currentColor" />
        <path d="M5.5 7.5 V5.2 a2.5 2.5 0 0 1 5 0 V7.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  };
  return (
    <span className="status-icon" data-bucket={bucket} aria-hidden="true">
      {glyph[bucket]}
    </span>
  );
}

// ── ProgressRing ──────────────────────────────────────────────────────────────

function ProgressRing({ pct, size = 92, stroke = 8 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - pct / 100);
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--bg-2)" strokeWidth={stroke} fill="none" />
      <circle cx={size / 2} cy={size / 2} r={r} stroke="url(#histRingGrad)" strokeWidth={stroke} fill="none"
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <defs>
        <linearGradient id="histRingGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--st-promociona)" />
          <stop offset="100%" stopColor="var(--st-aprobado)" />
        </linearGradient>
      </defs>
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" className="ring-text">
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

// ── StatTile ──────────────────────────────────────────────────────────────────

function StatTile({ label, value, sub, accent }: { label: string; value: number; sub?: string; accent: string }) {
  return (
    <div className="stat-tile" style={{ "--acc": accent } as React.CSSProperties}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

// ── FilterChips ───────────────────────────────────────────────────────────────

function FilterChips({ stats, active, onToggle, onClear, statusColors }: {
  stats: ReturnType<typeof computeStats>;
  active: Set<string>;
  onToggle: (key: string) => void;
  onClear: () => void;
  statusColors: Record<string, string>;
}) {
  return (
    <div className="chips">
      <button className={`chip ${active.size === 0 ? "on" : ""}`} onClick={onClear}>
        <span className="chip-dot" style={{ background: "linear-gradient(135deg, var(--st-promociona), var(--st-aprobado))" }} />
        Todas
        <span className="chip-count">{stats.total}</span>
      </button>
      {Object.entries(STATUS_META)
        .sort((a, b) => a[1].order - b[1].order)
        .map(([key, s]) => (
          <button key={key} className={`chip ${active.has(key) ? "on" : ""}`} onClick={() => onToggle(key)}>
            <span className="chip-dot" style={{ background: statusColors[key] || "var(--ink-3)" }} />
            {s.label}
            <span className="chip-count">{stats.byStatus[key] || 0}</span>
          </button>
        ))}
    </div>
  );
}

// ── MateriaListCard ───────────────────────────────────────────────────────────

function MateriaListCard({ m }: { m: MateriaWithFlags }) {
  const st = STATUS_META[m.situacion as keyof typeof STATUS_META];
  const bucket = bucketOf(m);

  return (
    <div
      className="card-list"
      data-bucket={bucket}
      style={{ "--accent": `var(${st?.varName ?? "--st-pendiente"})` } as React.CSSProperties}
      title={`${m.codigo} — ${st?.label ?? m.situacion}`}
    >
      <StatusIcon bucket={bucket} situacion={m.situacion} />
      <div className="card-short" title={m.codigo}>{shortCode(m.nombre)}</div>
      <div className="nombre">{titleCase(m.nombre)}</div>
      <div className="card-list-meta">
        {m.horas > 0 && <span className="card-meta-h">{m.horas}h</span>}
        {typeof m.nota === "number" && (
          <span className="nota" title="Nota">{m.nota}</span>
        )}
      </div>
    </div>
  );
}

// ── HistorialGroups ───────────────────────────────────────────────────────────

function HistorialGroups({ materias }: { materias: MateriaWithFlags[] }) {
  const groups = useMemo(() => buildHistorialGroups(materias), [materias]);

  if (!materias.some((m) => !m._faded)) {
    return (
      <div style={{ padding: "48px 0", textAlign: "center", color: "var(--ink-4)", fontFamily: "var(--font-fraunces), serif", fontSize: 16 }}>
        No hay materias para mostrar con el filtro seleccionado.
      </div>
    );
  }

  return (
    <div className="hist-groups">
      {groups.map(({ año, label, items, c1, c2 }) => {
        const approved = items.filter((m) => APPROVED_STATUSES.has(m.situacion)).length;
        const total = items.length;
        const pct = total ? (approved / total) * 100 : 0;
        const visibleItems = items.filter((m) => !m._faded);
        if (!visibleItems.length) return null;

        return (
          <div key={año} className="hist-year">
            <div className="ygroup-head">
              <div className="ygroup-title">
                <span className="ygroup-chev" aria-hidden="true">▾</span>
                <span className="ygroup-label">{label}</span>
              </div>
              <div className="ygroup-progress">
                <div className="ygroup-bar">
                  <div className="ygroup-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="ygroup-count">{approved}/{total}</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: c1.some(m => !m._faded) && c2.some(m => !m._faded) ? "1fr 1fr" : "1fr", gap: 16 }}>
              {([
                { cuatri: 1, list: c1, label: "1° Cuatrimestre" },
                { cuatri: 2, list: c2, label: "2° Cuatrimestre" },
              ] as const).map(({ list, label: cuatriLabel }) => {
                const visible = list.filter((m) => !m._faded);
                if (!visible.length) return null;
                return (
                  <div key={cuatriLabel} className="hist-cuatri">
                    <div className="hist-cuatri-head">{cuatriLabel}</div>
                    {visible.map((m) => (
                      <MateriaListCard key={m.codigo} m={m} />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

interface Props {
  student: Student;
  materias: Materia[];
}

export function HistorialPage({ student, materias }: Props) {
  const [active, setActive] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [statusColors, setStatusColors] = useState<Record<string, string>>({});

  useEffect(() => {
    const out: Record<string, string> = {};
    for (const [k, s] of Object.entries(STATUS_META)) {
      out[k] = getComputedStyle(document.documentElement).getPropertyValue(s.varName).trim() || "#888";
    }
    setStatusColors(out);
  }, []);

  const matchesFilter = (m: Materia) => {
    const statusOk = active.size === 0 || active.has(m.situacion);
    const q = query.trim().toLowerCase();
    const queryOk = !q || m.nombre.toLowerCase().includes(q) || m.codigo.toLowerCase().includes(q);
    return statusOk && queryOk;
  };

  const visibleMaterias = useMemo((): MateriaWithFlags[] => {
    const byCode = Object.fromEntries(materias.map((m) => [m.codigo, m]));
    return materias.map((m) => {
      const blockedBy = (m.correlativas || []).filter((c) => {
        const src = byCode[c];
        return !src || !APPROVED_STATUSES.has(src.situacion);
      });
      return {
        ...m,
        _faded: !matchesFilter(m),
        _blocked: m.situacion === "PENDIENTE" && blockedBy.length > 0,
        _blockedBy: blockedBy,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materias, active, query]);

  const stats = useMemo(() => computeStats(materias), [materias]);
  const pct = stats.total ? (stats.approvedCount / stats.total) * 100 : 0;
  const activeCount = (stats.byStatus.INSCRIPTO || 0) + (stats.byStatus.A_FINAL || 0) + (stats.byStatus.RECURSA || 0);

  const toggle = (key: string) => {
    const next = new Set(active);
    next.has(key) ? next.delete(key) : next.add(key);
    setActive(next);
  };

  return (
    <div className="app">
      {/* ── Topbar ── */}
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <svg viewBox="0 0 32 32" width="20" height="20">
              <path d="M6 22 L16 8 L26 22" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="16" cy="8" r="2" fill="var(--accent)" />
              <circle cx="6" cy="22" r="2" fill="var(--ink)" />
              <circle cx="26" cy="22" r="2" fill="var(--ink)" />
            </svg>
          </div>
          <div className="brand-meta">
            <div className="brand-name">facultad·sas</div>
            <div className="brand-sub">Historial académico</div>
          </div>
        </div>

        <div className="student">
          <div className="student-name">{titleCase(student.nombre)}</div>
          <div className="student-meta">
            <span>LU {student.lu}</span>
            <span className="dotsep" />
            <span>{student.plan}</span>
            <span className="dotsep" />
            <span>Plan {student.planCodigo}</span>
          </div>
        </div>

        <div className="topbar-actions">
          <Link href="/carrer-roadmap" className="icon-btn">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Malla
          </Link>
          <button className="icon-btn primary">Historial</button>
        </div>
      </header>

      {/* ── Stats row ── */}
      <section className="stats-row">
        <div className="stats-progress">
          <ProgressRing pct={pct} />
          <div className="stats-progress-meta">
            <div className="stats-progress-label">Progreso del plan</div>
            <div className="stats-progress-value">
              <strong>{stats.approvedCount}</strong>
              <span>de {stats.total} materias</span>
            </div>
            <div className="stats-progress-bar">
              <div className="bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="stats-progress-avg">
              <span className="avg-label">Promedio</span>
              <span className="avg-value">{stats.avg.toFixed(2)}</span>
              <span className="avg-sub">sobre {stats.withGradeCount} con nota</span>
            </div>
          </div>
        </div>

        <div className="stats-tiles">
          <StatTile label="Hechas" value={stats.approvedCount} sub={`${stats.horasAprob} h cursadas`} accent="var(--st-aprobado)" />
          <StatTile label="En curso" value={activeCount} sub={`${stats.byStatus.INSCRIPTO || 0} cursando · ${stats.byStatus.A_FINAL || 0} a final`} accent="var(--st-inscripto)" />
          <StatTile label="Disponibles" value={stats.available} sub="con correlativas listas" accent="var(--st-promociona)" />
          <StatTile label="Bloqueadas" value={stats.blocked} sub="falta cursar correlativas" accent="var(--st-pendiente)" />
        </div>
      </section>

      {/* ── Toolbar ── */}
      <section className="toolbar">
        <FilterChips stats={stats} active={active} onToggle={toggle} onClear={() => setActive(new Set())} statusColors={statusColors} />
        <div className="search">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input placeholder="Buscar materia o código…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </section>

      {/* ── Main area ── */}
      <div className="main-area">
        <HistorialGroups materias={visibleMaterias} />
      </div>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="legend-buckets">
          <span className="bk-chip" data-bucket="done">
            <span className="bk-swatch" />
            Hechas <span className="bk-count">{stats.approvedCount}</span>
          </span>
          <span className="bk-chip" data-bucket="active">
            <span className="bk-swatch" />
            En curso <span className="bk-count">{activeCount}</span>
          </span>
          <span className="bk-chip" data-bucket="available">
            <span className="bk-swatch" />
            Disponibles <span className="bk-count">{stats.available}</span>
          </span>
          <span className="bk-chip" data-bucket="blocked">
            <span className="bk-swatch" />
            Bloqueadas <span className="bk-count">{stats.blocked}</span>
          </span>
        </div>
        {student.documento && (
          <div className="footer-meta">
            DNI {student.documento}
            {student.fechaNacimiento && ` · Nac. ${student.fechaNacimiento}`}
          </div>
        )}
      </footer>
    </div>
  );
}
