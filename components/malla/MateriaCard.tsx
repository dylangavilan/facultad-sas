"use client";

import type { Situacion } from "@/types/historial";
import {
  STATUS_META,
  bucketOf,
  shortCode,
  titleCase,
  type Bucket,
  type MateriaWithFlags,
  type SharedCardProps,
} from "./helpers";

function StatusIcon({
  bucket,
  situacion,
}: {
  bucket: Bucket;
  situacion: Situacion;
}) {
  const glyph: Record<Bucket, React.ReactNode> = {
    done: (
      <svg viewBox="0 0 16 16" width="11" height="11">
        <path
          d="M3.5 8.5 L7 12 L13 4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    active:
      situacion === "A_FINAL" ? (
        <svg viewBox="0 0 16 16" width="11" height="11">
          <path
            d="M8 3 V9 M8 12 V12.5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      ) : situacion === "RECURSA" ? (
        <svg viewBox="0 0 16 16" width="11" height="11">
          <path
            d="M12 5 A4 4 0 1 0 13 9"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M10 3 L13 5 L11 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" width="11" height="11">
          <circle cx="8" cy="8" r="2.5" fill="currentColor" />
        </svg>
      ),
    available: (
      <svg viewBox="0 0 16 16" width="11" height="11">
        <path
          d="M3 4 H7 a2 2 0 0 1 2 2 V13 a2 2 0 0 0 -2 -2 H3 Z M13 4 H9 a2 2 0 0 0 -2 2 V13 a2 2 0 0 1 2 -2 H13 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
    blocked: (
      <svg viewBox="0 0 16 16" width="11" height="11">
        <rect
          x="3.5"
          y="7.5"
          width="9"
          height="6"
          rx="1.2"
          fill="currentColor"
        />
        <path
          d="M5.5 7.5 V5.2 a2.5 2.5 0 0 1 5 0 V7.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    ),
  };

  return (
    <span className="status-icon" data-bucket={bucket} aria-hidden="true">
      {glyph[bucket]}
    </span>
  );
}

const YEAR_SHORTLABEL: Record<string, string> = {
  PRIMER_AÑO: "Año 1",
  SEGUNDO_AÑO: "Año 2",
  TERCER_AÑO: "Año 3",
  CUARTO_AÑO: "Año 4",
  QUINTO_AÑO: "Año 5",
  OPTATIVAS: "Optativa",
  ANEXO: "Anexo",
};

interface Props extends SharedCardProps {
  m: MateriaWithFlags;
}

export function MateriaCard({
  m,
  related,
  hoveredId,
  selectedId,
  registerRef,
  onHover,
  onLeave,
  onSelect,
}: Props) {
  const st = STATUS_META[m.situacion as keyof typeof STATUS_META];
  const isHovered = hoveredId === m.codigo;
  const isSelected = selectedId === m.codigo;
  const isPrereq = related.prereqs.has(m.codigo);
  const isDependent = related.dependents.has(m.codigo);
  const isDim = !!hoveredId && !isHovered && !isPrereq && !isDependent;
  const bucket = bucketOf(m);
  const relAttr = isHovered
    ? "hovered"
    : isPrereq
      ? "prereq"
      : isDependent
        ? "dependent"
        : "none";
  const yearLabel = YEAR_SHORTLABEL[m.año] || "";
  const cuatriLabel = m.cuatrimestre ? `· C${m.cuatrimestre}` : "";

  return (
    <div
      ref={(el) => registerRef(m.codigo, el)}
      data-card-code={m.codigo}
      className="card"
      data-status={m.situacion}
      data-bucket={bucket}
      data-hovered={isHovered ? "1" : "0"}
      data-selected={isSelected ? "1" : "0"}
      data-related={relAttr}
      data-faded={m._faded ? "1" : "0"}
      data-dim={isDim ? "1" : "0"}
      style={
        {
          "--accent": `var(${st?.varName ?? "--st-pendiente"})`,
        } as React.CSSProperties
      }
      onClick={() => onSelect(m.codigo)}
      onMouseEnter={() => onHover(m.codigo)}
      onMouseLeave={onLeave}
      title={`${m.codigo} — ${st?.label ?? m.situacion}`}
    >
      <div className="card-row">
        <StatusIcon bucket={bucket} situacion={m.situacion} />
        <div className="card-short" title={m.codigo}>
          {shortCode(m.nombre)}
        </div>
      </div>
      <div className="nombre">{titleCase(m.nombre)}</div>
      <div className="card-foot">
        <span className="card-meta">
          {yearLabel} {cuatriLabel}
          {m.horas > 0 && <span className="card-meta-h"> · {m.horas}h</span>}
        </span>
        {typeof m.nota === "number" && (
          <span className="nota" title="Nota">
            {m.nota}
          </span>
        )}
      </div>
      {bucket === "blocked" && m._blockedBy.length > 0 && (
        <div className="blocked-meta">
          <span>Falta</span> <strong>{m._blockedBy.length}</strong>{" "}
          {m._blockedBy.length === 1 ? "correlativa" : "correlativas"}
        </div>
      )}
      {st === STATUS_META.A_FINAL && (
        <div className="blocked-meta">FALTA RENDIR PREVIO</div>
      )}

      {st === STATUS_META.INSCRIPTO && (
        <div className="blocked-meta">EN CURSO</div>
      )}
    </div>
  );
}
