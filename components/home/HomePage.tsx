"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import type { Materia, Student } from "@/types/historial";
import {
  APPROVED_STATUSES,
  STATUS_META,
  titleCase,
  computeStats,
} from "@/components/malla/helpers";

// ── helpers ──────────────────────────────────────────────────────────────────

const YEAR_SHORT: Record<string, string> = {
  PRIMER_AÑO: "Año 1",
  SEGUNDO_AÑO: "Año 2",
  TERCER_AÑO: "Año 3",
  CUARTO_AÑO: "Año 4",
  QUINTO_AÑO: "Año 5",
  OPTATIVAS: "Optativas",
  ANEXO: "Anexo",
};

const DAYS_ES = ["DOMINGO", "LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"];
const MONTHS_ES = ["ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO","JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"];

function formatDate(d: Date) {
  return `${DAYS_ES[d.getDay()]} ${d.getDate()} DE ${MONTHS_ES[d.getMonth()]}`;
}

// ── ProgressRing ──────────────────────────────────────────────────────────────

function ProgressRing({ pct, size = 92, stroke = 8 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - pct / 100);
  return (
    <svg width={size} height={size} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--bg-2)" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        stroke="url(#homeRingGrad)" strokeWidth={stroke} fill="none"
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <defs>
        <linearGradient id="homeRingGrad" x1="0" y1="0" x2="1" y2="1">
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

// ── App ───────────────────────────────────────────────────────────────────────

interface Props {
  student: Student;
  materias: Materia[];
}

export function HomePage({ student, materias }: Props) {
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => { setToday(new Date()); }, []);

  const byCode = useMemo(
    () => Object.fromEntries(materias.map((m) => [m.codigo, m])),
    [materias]
  );

  const stats = useMemo(() => computeStats(materias), [materias]);
  const pct = stats.total ? (stats.approvedCount / stats.total) * 100 : 0;

  const cuatriActual = useMemo(
    () => materias.filter((m) => m.situacion === "INSCRIPTO"),
    [materias]
  );
  const aFinal = useMemo(
    () => materias.filter((m) => m.situacion === "A_FINAL"),
    [materias]
  );
  const disponibles = useMemo(
    () =>
      materias.filter((m) => {
        if (m.situacion !== "PENDIENTE") return false;
        return (m.correlativas || []).every((c) => {
          const s = byCode[c];
          return s && APPROVED_STATUSES.has(s.situacion);
        });
      }),
    [materias, byCode]
  );

  const firstName = titleCase(student.nombre).split(" ")[0];
  const inscribiendo = cuatriActual.filter((m) => m.situacion === "INSCRIPTO").length;

  return (
    <main className="main">
      {/* ── Top bar ── */}
      <header className="main-bar">
        <div className="crumbs">
          <span className="here">Inicio</span>
          <span className="crumb-sep">›</span>
          <span>Resumen</span>
        </div>
        <div className="main-bar-actions">
          <div className="search" style={{ minWidth: 220 }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <circle cx="7" cy="7" r="4.5" />
              <path d="M10.5 10.5 L14 14" />
            </svg>
            <input type="search" placeholder="Buscar materias…" readOnly />
          </div>
          <button className="icon-btn" type="button">Ayuda</button>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="home-content">

        {/* Hero */}
        <section className="hero">
          <div>
            {today && <div className="hero-eyebrow">{formatDate(today)}</div>}
            <h1 className="hero-title">
              Hola, <em>{firstName}</em>.
            </h1>
            <p className="hero-sub">
              {cuatriActual.length > 0 ? (
                <>
                  Tenés{" "}
                  <strong>{cuatriActual.length} {cuatriActual.length === 1 ? "materia" : "materias"} en curso</strong>
                  {aFinal.length > 0 && (
                    <> y <strong>{aFinal.length} {aFinal.length === 1 ? "materia" : "materias"} a rendir final</strong></>
                  )}
                  .
                </>
              ) : aFinal.length > 0 ? (
                <>Tenés <strong>{aFinal.length} {aFinal.length === 1 ? "materia" : "materias"} a rendir final</strong>.</>
              ) : (
                <>Tenés <strong>{disponibles.length} materias disponibles</strong> para inscribirte.</>
              )}
            </p>
          </div>
          <div className="hero-actions">
            <Link href="/carrer-roadmap" className="icon-btn primary">
              Ver malla completa
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8 H12 M8 4 L12 8 L8 12" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Stats row */}
        <section className="stats-row" style={{ padding: 0 }}>
          <div className="stats-progress">
            <ProgressRing pct={pct} />
            <div className="stats-progress-meta">
              <div className="stats-progress-label">PROGRESO DEL PLAN</div>
              <div className="stats-progress-value">
                <strong>{stats.approvedCount}</strong>
                <span>de {stats.total} materias</span>
              </div>
              <div className="stats-progress-bar">
                <div className="bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="stats-progress-avg">
                <span className="avg-label">PROMEDIO</span>
                <span className="avg-value">{stats.avg.toFixed(2)}</span>
                <span className="avg-sub">sobre {stats.withGradeCount} con nota</span>
              </div>
            </div>
          </div>
          <div className="stats-tiles">
            <div className="stat-tile" style={{ "--acc": "var(--st-aprobado)" } as React.CSSProperties}>
              <div className="stat-label">HECHAS</div>
              <div className="stat-value">{stats.approvedCount}</div>
              <div className="stat-sub">{stats.horasAprob} h cursadas</div>
            </div>
            <div className="stat-tile" style={{ "--acc": "var(--st-inscripto)" } as React.CSSProperties}>
              <div className="stat-label">EN CURSO</div>
              <div className="stat-value">{cuatriActual.length}</div>
              <div className="stat-sub">{inscribiendo} cursando · {aFinal.length} a final</div>
            </div>
            <div className="stat-tile" style={{ "--acc": "var(--st-promociona)" } as React.CSSProperties}>
              <div className="stat-label">DISPONIBLES</div>
              <div className="stat-value">{disponibles.length}</div>
              <div className="stat-sub">con correlativas listas</div>
            </div>
            <div className="stat-tile" style={{ "--acc": "var(--st-pendiente)" } as React.CSSProperties}>
              <div className="stat-label">BLOQUEADAS</div>
              <div className="stat-value">{stats.blocked}</div>
              <div className="stat-sub">falta cursar correlativas</div>
            </div>
          </div>
        </section>

        {/* Two-col: cuatri actual + a rendir */}
        <section className="two-col">
          <div>
            <div className="section-head">
              <h2 className="section-title">Tu cuatrimestre actual</h2>
              <span className="section-sub">
                {cuatriActual.length} {cuatriActual.length === 1 ? "materia" : "materias"} en curso
              </span>
            </div>
            <div className="actual-grid">
              {cuatriActual.map((m) => {
                const st = STATUS_META[m.situacion as keyof typeof STATUS_META];
                return (
                  <div key={m.codigo} className="actual-card" style={{ "--c": `var(${st.varName})` } as React.CSSProperties}>
                    <div className="actual-head">
                      <span className="actual-status">{st.label}</span>
                      <span className="actual-code">{m.codigo}</span>
                    </div>
                    <div className="actual-name">{titleCase(m.nombre)}</div>
                    <div className="actual-meta">
                      <span>{YEAR_SHORT[m.año]} · C{m.cuatrimestre}</span>
                      {m.horas > 0 && <span className="actual-meta-h">{m.horas} h</span>}
                    </div>
                    <div className="actual-foot">
                      <span className="actual-next">
                        {m.situacion === "RECURSA" ? (
                          <>
                            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 5 A4 4 0 1 0 13 9" /><path d="M10 3 L13 5 L11 8" />
                            </svg>
                            Segunda cursada
                          </>
                        ) : (
                          <>
                            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                              <circle cx="8" cy="8" r="5.5" /><path d="M8 5 V8 L10 9.5" />
                            </svg>
                            Cursando
                          </>
                        )}
                      </span>
                      <Link className="mini-btn" href="/carrer-roadmap">Ver →</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* A rendir final */}
          <div>
            <div className="agenda-panel">
              <div className="section-head" style={{ padding: "14px 16px 10px", marginBottom: 0 }}>
                <h2 className="section-title" style={{ fontSize: 17 }}>A rendir final</h2>
                <Link className="section-link" href="/carrer-roadmap">Malla →</Link>
              </div>
              {aFinal.length > 0 ? (
                <ul className="agenda-list">
                  {aFinal.map((m) => (
                    <li
                      key={m.codigo}
                      className="agenda-item"
                      style={{ gridTemplateColumns: "1fr auto", "--c": "var(--st-afinal)" } as React.CSSProperties}
                    >
                      <div>
                        <div className="agenda-title">Final · {titleCase(m.nombre)}</div>
                        <div className="agenda-meta">
                          {YEAR_SHORT[m.año]} · C{m.cuatrimestre}
                          {" · "}
                          <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10 }}>
                            {m.codigo}
                          </span>
                        </div>
                      </div>
                      <span className="agenda-chip">Final</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ padding: "28px 16px", textAlign: "center", color: "var(--ink-4)", fontSize: 13 }}>
                  No hay materias a rendir final.
                </div>
              )}
              <div className="agenda-foot">
                <Link href="/carrer-roadmap">Ver plan completo →</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Disponibles */}
        {disponibles.length > 0 && (
          <section>
            <div className="section-head">
              <h2 className="section-title">Listas para inscribirte</h2>
              <span className="section-sub">{disponibles.length} materias con correlativas listas</span>
            </div>
            <div className="dispo-grid">
              {disponibles.slice(0, 6).map((m) => (
                <div key={m.codigo} className="dispo-card">
                  <div className="dispo-row">
                    <span className="dispo-code">{m.codigo}</span>
                    <span className="dispo-tag">
                      <span className="dispo-tag-dot" />
                      Disponible
                    </span>
                  </div>
                  <h3 className="dispo-name">{titleCase(m.nombre)}</h3>
                  <div className="dispo-meta">
                    <span>{YEAR_SHORT[m.año]} · C{m.cuatrimestre}</span>
                    {m.horas > 0 && <span className="dispo-meta-h">· {m.horas} h</span>}
                  </div>
                  <div className="dispo-foot">
                    <span className="dispo-meta" style={{ marginTop: 0 }}>correlativas listas</span>
                    <Link className="mini-btn" href="/carrer-roadmap">Ver →</Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* Footer */}
      <footer className="footer-mini">
        <span>facultad·sas · v0.3</span>
        {student.documento && (
          <span>
            DNI {student.documento}
            {student.fechaNacimiento && ` · Nac. ${student.fechaNacimiento}`}
          </span>
        )}
      </footer>
    </main>
  );
}
