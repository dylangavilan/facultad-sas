"use client";

import {
  useState,
  useMemo,
  useRef,
  useLayoutEffect,
  useEffect,
  useCallback,
} from "react";
import type { Materia, Situacion, HistorialResponse } from "@/types/historial";
import { titleCase } from "./helpers";
import { MateriaCard } from "./MateriaCard";
import { EdgeLayer } from "./EdgeLayer";
import { MateriaEditorPopover } from "./MateriaEditorPopover";
import {
  APPROVED_STATUSES,
  STATUS_META,
  buildYearGroups,
  computeStats,
  type MateriaWithFlags,
  type YearGroupData,
  type SubColData,
  type SharedCardProps,
} from "./helpers";

// ── ProgressRing ────────────────────────────────────────────────────────────

function ProgressRing({
  pct,
  size = 92,
  stroke = 8,
}: {
  pct: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - pct / 100);
  return (
    <svg width={size} height={size}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="var(--bg-2)"
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="url(#ringGrad)"
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={off}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <defs>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--st-promociona)" />
          <stop offset="100%" stopColor="var(--st-aprobado)" />
        </linearGradient>
      </defs>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy="0.35em"
        className="ring-text"
      >
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

// ── StatTile ─────────────────────────────────────────────────────────────────

function StatTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number;
  sub?: string;
  accent: string;
}) {
  return (
    <div
      className="stat-tile"
      style={{ "--acc": accent } as React.CSSProperties}
    >
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

// ── FilterChips ───────────────────────────────────────────────────────────────

function FilterChips({
  stats,
  active,
  onToggle,
  onClear,
  statusColors,
}: {
  stats: ReturnType<typeof computeStats>;
  active: Set<string>;
  onToggle: (key: string) => void;
  onClear: () => void;
  statusColors: Record<string, string>;
}) {
  return (
    <div className="chips">
      <button
        className={`chip ${active.size === 0 ? "on" : ""}`}
        onClick={onClear}
      >
        <span
          className="chip-dot"
          style={{
            background:
              "linear-gradient(135deg, var(--st-promociona), var(--st-aprobado))",
          }}
        />
        Todas
        <span className="chip-count">{stats.total}</span>
      </button>
      {Object.entries(STATUS_META)
        .sort((a, b) => a[1].order - b[1].order)
        .map(([key, s]) => (
          <button
            key={key}
            className={`chip ${active.has(key) ? "on" : ""}`}
            onClick={() => onToggle(key)}
          >
            <span
              className="chip-dot"
              style={{ background: statusColors[key] || "var(--ink-3)" }}
            />
            {s.label}
            <span className="chip-count">{stats.byStatus[key] || 0}</span>
          </button>
        ))}
    </div>
  );
}

// ── SubColumn + YearGroup ─────────────────────────────────────────────────────

function SubColumn({
  col,
  ...rest
}: { col: SubColData } & SharedCardProps) {
  return (
    <div className="subcol">
      <div className="subcol-head">{col.label}</div>
      <div className="subcol-cards">
        {col.items.map((m) => (
          <MateriaCard key={m.codigo} m={m} {...rest} />
        ))}
      </div>
    </div>
  );
}

function YearGroup({
  group,
  ...rest
}: { group: YearGroupData } & SharedCardProps) {
  const approved = group.items.filter((m) =>
    APPROVED_STATUSES.has(m.situacion)
  ).length;
  const total = group.items.length;
  const pct = total ? (approved / total) * 100 : 0;

  return (
    <div className="ygroup" data-kind={group.kind}>
      <div className="ygroup-head">
        <div className="ygroup-title">
          <span className="ygroup-chev" aria-hidden="true">
            ▾
          </span>
          <span className="ygroup-label">{group.label}</span>
        </div>
        <div className="ygroup-progress">
          <div className="ygroup-bar">
            <div className="ygroup-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="ygroup-count">
            {approved}/{total}
          </span>
        </div>
      </div>
      <div className="ygroup-cols" data-cols={group.cols.length}>
        {group.cols.map((c) => (
          <SubColumn key={c.id} col={c} {...rest} />
        ))}
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

interface Position {
  left: number;
  right: number;
  top: number;
  bottom: number;
  midX: number;
  midY: number;
}

interface Props {
  plans: HistorialResponse[];
}

export function PlanDeEstudios({ plans }: Props) {
  const [planIndex, setPlanIndex] = useState(0);
  const { student, materias: planMaterias } = plans[planIndex];

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [active, setActive] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [positions, setPositions] = useState<Record<string, Position>>({});
  const [statusColors, setStatusColors] = useState<Record<string, string>>({});
  // TODO: wire to backend / store when available
  const [localMaterias, setLocalMaterias] = useState<Materia[]>(planMaterias);

  const innerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement>>({});

  useEffect(() => {
    const out: Record<string, string> = {};
    for (const [k, s] of Object.entries(STATUS_META)) {
      out[k] =
        getComputedStyle(document.documentElement)
          .getPropertyValue(s.varName)
          .trim() || "#888";
    }
    setStatusColors(out);
  }, []);

  // Reset all derived state when switching plans
  useEffect(() => {
    setLocalMaterias(plans[planIndex].materias);
    setSelectedId(null);
    setHoveredId(null);
    setActive(new Set());
    setQuery("");
  }, [planIndex, plans]);

  const matchesFilter = (m: Materia) => {
    const statusOk = active.size === 0 || active.has(m.situacion);
    const q = query.trim().toLowerCase();
    const queryOk =
      !q ||
      m.nombre.toLowerCase().includes(q) ||
      m.codigo.toLowerCase().includes(q);
    return statusOk && queryOk;
  };

  const visibleMaterias = useMemo((): MateriaWithFlags[] => {
    const byCode = Object.fromEntries(localMaterias.map((m) => [m.codigo, m]));
    return localMaterias.map((m) => {
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
  }, [localMaterias, active, query]);

  const stats = useMemo(() => computeStats(localMaterias), [localMaterias]);
  const pct = stats.total ? (stats.approvedCount / stats.total) * 100 : 0;
  const groups = useMemo(
    () => buildYearGroups(visibleMaterias),
    [visibleMaterias]
  );

  const related = useMemo(() => {
    const prereqs = new Set<string>();
    const dependents = new Set<string>();
    if (!hoveredId) return { prereqs, dependents };
    const byCode = Object.fromEntries(localMaterias.map((m) => [m.codigo, m]));

    // BFS hacia atrás: todos los ancestros (prereqs transitivos)
    const prereqQueue = [...(byCode[hoveredId]?.correlativas || [])];
    while (prereqQueue.length) {
      const code = prereqQueue.shift()!;
      if (prereqs.has(code)) continue;
      prereqs.add(code);
      byCode[code]?.correlativas?.forEach((c) => prereqQueue.push(c));
    }

    // BFS hacia adelante: todos los descendientes (dependents transitivos)
    const depQueue: string[] = [];
    for (const m of localMaterias) {
      if (m.correlativas?.includes(hoveredId)) depQueue.push(m.codigo);
    }
    while (depQueue.length) {
      const code = depQueue.shift()!;
      if (dependents.has(code)) continue;
      dependents.add(code);
      for (const m of localMaterias) {
        if (m.correlativas?.includes(code)) depQueue.push(m.codigo);
      }
    }

    return { prereqs, dependents };
  }, [hoveredId, localMaterias]);

  const registerRef = (code: string, el: HTMLDivElement | null) => {
    if (el) cardRefs.current[code] = el;
    else delete cardRefs.current[code];
  };

  const measure = () => {
    const inner = innerRef.current;
    if (!inner) return;
    const innerRect = inner.getBoundingClientRect();
    const out: Record<string, Position> = {};
    for (const [code, el] of Object.entries(cardRefs.current)) {
      if (!el || !el.isConnected) continue;
      const r = el.getBoundingClientRect();
      out[code] = {
        left: r.left - innerRect.left,
        right: r.right - innerRect.left,
        top: r.top - innerRect.top,
        bottom: r.bottom - innerRect.top,
        midY: r.top - innerRect.top + r.height / 2,
        midX: r.left - innerRect.left + r.width / 2,
      };
    }
    setPositions(out);
  };

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(() => measure());
    if (innerRef.current) ro.observe(innerRef.current);
    window.addEventListener("resize", measure);
    if (document.fonts?.ready) document.fonts.ready.then(measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups]);

  const toggle = (key: string) => {
    const next = new Set(active);
    next.has(key) ? next.delete(key) : next.add(key);
    setActive(next);
  };

  const handleUpdate = useCallback(
    (codigo: string, patch: { situacion?: Situacion; nota?: number }) => {
      setLocalMaterias((prev) =>
        prev.map((m) => {
          if (m.codigo !== codigo) return m;
          const next = { ...m };
          if (patch.situacion !== undefined) next.situacion = patch.situacion;
          if ("nota" in patch) {
            if (patch.nota === undefined) {
              delete next.nota;
            } else {
              next.nota = patch.nota;
            }
          }
          return next;
        })
      );
    },
    []
  );

  const handleSelect = useCallback((codigo: string) => {
    setSelectedId((prev) => (prev === codigo ? null : codigo));
  }, []);

  const activeCount =
    (stats.byStatus.INSCRIPTO || 0);
    
  return (
    <div className="app">
      {/* ── Plan switcher ── */}
      {plans.length > 1 && (
        <div className="plan-switcher">
          {plans.map((p, i) => (
            <button
              key={i}
              className={`plan-tab${planIndex === i ? " on" : ""}`}
              onClick={() => setPlanIndex(i)}
            >
              <span className="plan-tab-name">{titleCase(p.student.plan)}</span>
              <span className="plan-tab-code">{p.student.planCodigo}</span>
            </button>
          ))}
        </div>
      )}

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
              <span className="avg-sub">
                sobre {stats.withGradeCount} con nota
              </span>
            </div>
          </div>
        </div>

        <div className="stats-tiles">
          <StatTile
            label="Hechas"
            value={stats.approvedCount}
            sub={`${stats.horasAprob} h cursadas`}
            accent="var(--st-aprobado)"
          />
          <StatTile
            label="En curso"
            value={activeCount}
            sub={`${stats.byStatus.INSCRIPTO || 0} cursando · ${stats.byStatus.A_FINAL || 0} a final`}
            accent="var(--st-inscripto)"
          />
          <StatTile
            label="Disponibles"
            value={stats.available}
            sub="con correlativas listas"
            accent="var(--st-promociona)"
          />
          <StatTile
            label="Bloqueadas"
            value={stats.blocked}
            sub="falta cursar correlativas"
            accent="var(--st-pendiente)"
          />
        </div>
      </section>

      {/* ── Toolbar ── */}
      <section className="toolbar">
        <FilterChips
          stats={stats}
          active={active}
          onToggle={toggle}
          onClear={() => setActive(new Set())}
          statusColors={statusColors}
        />
        <div className="search">
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            placeholder="Buscar materia o código…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </section>

      {/* ── Malla ── */}
      <div className="malla-wrap">
        <div className="malla">
          <div className="malla-inner" ref={innerRef}>
            <EdgeLayer
              materias={visibleMaterias}
              positions={positions}
              hoveredId={hoveredId}
              related={related}
              statusColors={statusColors}
            />
            {groups.map((group) => (
              <YearGroup
                key={group.id}
                group={group}
                related={related}
                hoveredId={hoveredId}
                selectedId={selectedId}
                registerRef={registerRef}
                onHover={(id) => setHoveredId(id)}
                onLeave={() => setHoveredId(null)}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
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
          <span className="legend-sep" />
          <span className="legend-hint">
            <span
              className="hint-swatch"
              style={{ background: "var(--st-afinal)" }}
            />
            <span>requiere</span>
            <span
              className="hint-swatch"
              style={{ background: "var(--st-inscripto)", marginLeft: 6 }}
            />
            <span>habilita</span>
          </span>
        </div>
        {student.documento && (
          <div className="footer-meta">
            DNI {student.documento}
            {student.fechaNacimiento && ` · Nac. ${student.fechaNacimiento}`}
          </div>
        )}
      </footer>

      {/* ── Materia editor popover (position: fixed, outside overflow) ── */}
      {selectedId && cardRefs.current[selectedId] && (() => {
        const m = localMaterias.find((x) => x.codigo === selectedId);
        if (!m) return null;
        return (
          <MateriaEditorPopover
            materia={m}
            statusColors={statusColors}
            anchorEl={cardRefs.current[selectedId]}
            onUpdate={(patch) => handleUpdate(selectedId, patch)}
            onClose={() => setSelectedId(null)}
          />
        );
      })()}
    </div>
  );
}
