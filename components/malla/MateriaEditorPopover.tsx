"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { Situacion } from "@/types/historial";
import { NOTA_STATUSES, STATUS_META, titleCase } from "./helpers";

// ── Types ────────────────────────────────────────────────────────────────────

export type MateriaPatch = { situacion?: Situacion; nota?: number };

type Placement = "right" | "left" | "below";

interface PopoverPos {
  top: number;
  left: number;
  placement: Placement;
}

// ── Positioning ──────────────────────────────────────────────────────────────

const POP_W = 304;
const POP_GAP = 14;

function computePos(anchor: DOMRect, popH: number): PopoverPos {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const PAD = 8;

  const idealTop = anchor.top + anchor.height / 2 - popH / 2;
  const clampedTop = Math.max(PAD, Math.min(idealTop, vh - popH - PAD));

  if (anchor.right + POP_GAP + POP_W <= vw - PAD) {
    return { top: clampedTop, left: anchor.right + POP_GAP, placement: "right" };
  }
  if (anchor.left - POP_GAP - POP_W >= PAD) {
    return {
      top: clampedTop,
      left: anchor.left - POP_GAP - POP_W,
      placement: "left",
    };
  }
  const idealLeft = anchor.left + anchor.width / 2 - POP_W / 2;
  const clampedLeft = Math.max(PAD, Math.min(idealLeft, vw - POP_W - PAD));
  return { top: anchor.bottom + POP_GAP, left: clampedLeft, placement: "below" };
}

// ── Constants ────────────────────────────────────────────────────────────────

const YEAR_SHORT: Record<string, string> = {
  PRIMER_AÑO: "1° Año",
  SEGUNDO_AÑO: "2° Año",
  TERCER_AÑO: "3° Año",
  CUARTO_AÑO: "4° Año",
  QUINTO_AÑO: "5° Año",
  OPTATIVAS: "Optativas",
  ANEXO: "Anexo",
};

// ── Component ────────────────────────────────────────────────────────────────

interface Props {
  materia: {
    codigo: string;
    nombre: string;
    situacion: Situacion;
    nota?: number;
    año: string;
    cuatrimestre?: number;
  };
  statusColors: Record<string, string>;
  anchorEl: HTMLDivElement;
  onUpdate: (patch: MateriaPatch) => void;
  onClose: () => void;
}

export function MateriaEditorPopover({
  materia,
  statusColors,
  anchorEl,
  onUpdate,
  onClose,
}: Props) {
  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<PopoverPos | null>(null);
  const [visible, setVisible] = useState(false);

  const reposition = useCallback(() => {
    const rect = anchorEl.getBoundingClientRect();
    const popH = popRef.current?.offsetHeight ?? 340;
    setPos(computePos(rect, popH));
  }, [anchorEl]);

  // Initial position (before paint)
  useLayoutEffect(() => {
    reposition();
  }, [reposition]);

  // Trigger entrance animation after first paint
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Reposition whenever popover height changes (nota section toggle)
  useEffect(() => {
    const el = popRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => reposition());
    ro.observe(el);
    return () => ro.disconnect();
  }, [reposition]);

  // Esc closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Scroll anywhere closes (including inside .malla which overflows)
  useEffect(() => {
    const onScroll = () => onClose();
    window.addEventListener("scroll", onScroll, { capture: true });
    return () => window.removeEventListener("scroll", onScroll, { capture: true });
  }, [onClose]);

  // Click outside closes — but clicks on cards are handled by their own onClick
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (popRef.current?.contains(e.target as Node)) return;
      const isCard = !!(e.target as Element).closest("[data-card-code]");
      if (!isCard) onClose();
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [onClose]);

  // ── Derived values ──────────────────────────────────────────────────────────

  const st = STATUS_META[materia.situacion as keyof typeof STATUS_META];
  const accentColor = statusColors[materia.situacion] || "#888";
  const accentVar = st?.varName ?? "--st-pendiente";
  const admitsNota = NOTA_STATUSES.has(materia.situacion);
  const currentNota = materia.nota;

  const cuatriLabel = materia.cuatrimestre ? `C${materia.cuatrimestre}` : "—";
  const selloCode = materia.codigo.replace(/\./g, "·");

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleStatusChange = (key: string) => {
    const patch: MateriaPatch = { situacion: key as Situacion };
    if (!NOTA_STATUSES.has(key as Situacion)) patch.nota = undefined;
    onUpdate(patch);
  };

  const setNota = (val: number | undefined) => onUpdate({ nota: val });

  // ── Render ──────────────────────────────────────────────────────────────────

  if (!pos) return null;

  const transformOrigin =
    pos.placement === "right"
      ? "left center"
      : pos.placement === "left"
        ? "right center"
        : "top center";

  const tapeStyle: React.CSSProperties = {
    transform: `rotate(${pos.placement === "left" ? "2.5deg" : "-2.5deg"})`,
    ...(pos.placement === "left" ? { left: "40px" } : { right: "40px" }),
  };

  return (
    <div
      ref={popRef}
      className="mpop"
      data-placement={pos.placement}
      data-visible={visible ? "1" : "0"}
      style={
        {
          top: pos.top,
          left: pos.left,
          "--pop-accent": `var(${accentVar})`,
          transformOrigin,
        } as React.CSSProperties
      }
    >
      {/* Washi tape decoration */}
      <div className="mpop-tape" style={tapeStyle} />

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="mpop-header">
        <div className="mpop-header-main">
          <div className="mpop-codigo">{materia.codigo}</div>
          <div className="mpop-nombre">{titleCase(materia.nombre)}</div>
          <div className="mpop-subline">
            <span
              className="mpop-status-dot"
              style={{ background: accentColor }}
            />
            <span className="mpop-status-label">{st?.label ?? materia.situacion}</span>
            <span className="mpop-dot-sep">·</span>
            <span className="mpop-meta-inline">
              {YEAR_SHORT[materia.año] ?? materia.año} · {cuatriLabel}
            </span>
          </div>
        </div>
        <button className="mpop-close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>
      </div>

      {/* ── Estado chips ────────────────────────────────────────────── */}
      <div className="mpop-section-label">Estado</div>
      <div className="mpop-chips">
        {Object.entries(STATUS_META).map(([key, s]) => {
          const isActive = materia.situacion === key;
          const c = statusColors[key] || "#888";
          return (
            <button
              key={key}
              className={`mpop-chip${isActive ? " active" : ""}`}
              style={{ "--c": c } as React.CSSProperties}
              onClick={() => handleStatusChange(key)}
            >
              <span className="mpop-chip-dot" />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* ── Nota ────────────────────────────────────────────────────── */}
      <div className="mpop-nota-wrap">
        {admitsNota ? (
          <>
            <div className="mpop-section-label">Nota</div>
            <div className="mpop-nota-row">
              <div className="mpop-nota-group">
                <button
                  className="mpop-nota-btn"
                  onClick={() =>
                    setNota(Math.max(1, (currentNota ?? 1) - 1))
                  }
                  disabled={currentNota === undefined || currentNota <= 1}
                >
                  −
                </button>
                <input
                  type="number"
                  className="mpop-nota-input"
                  min={1}
                  max={10}
                  value={currentNota ?? ""}
                  placeholder="—"
                  onChange={(e) => {
                    if (!e.target.value) {
                      setNota(undefined);
                      return;
                    }
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v) && v >= 1 && v <= 10) setNota(v);
                  }}
                />
                <span className="mpop-nota-sep">/ 10</span>
                <button
                  className="mpop-nota-btn"
                  onClick={() =>
                    setNota(Math.min(10, (currentNota ?? 0) + 1))
                  }
                  disabled={currentNota !== undefined && currentNota >= 10}
                >
                  +
                </button>
              </div>
              {currentNota !== undefined && (
                <button
                  className="mpop-nota-clear"
                  onClick={() => setNota(undefined)}
                  aria-label="Borrar nota"
                >
                  ×
                </button>
              )}
            </div>
          </>
        ) : (
          <p className="mpop-nota-none">Este estado no lleva nota</p>
        )}
      </div>

      {/* ── Sello / stamp ───────────────────────────────────────────── */}
      <div className="mpop-sello">{selloCode}</div>
    </div>
  );
}
