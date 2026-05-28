import type { Materia } from "@/types/historial";
import { LABEL_SITUACION } from "@/lib/historial";

const SITUACION_COLORS: Record<
  string,
  { border: string; badge: string; text: string }
> = {
  PROMOCIONA: {
    border: "border-l-emerald-500",
    badge: "bg-emerald-500/10 border-emerald-500/20",
    text: "text-emerald-400",
  },
  APROBADO: {
    border: "border-l-emerald-500",
    badge: "bg-emerald-500/10 border-emerald-500/20",
    text: "text-emerald-400",
  },
  EQUIV_INTERNA: {
    border: "border-l-emerald-500",
    badge: "bg-emerald-500/10 border-emerald-500/20",
    text: "text-emerald-400",
  },
  A_FINAL: {
    border: "border-l-amber-500",
    badge: "bg-amber-500/10 border-amber-500/20",
    text: "text-amber-400",
  },
  INSCRIPTO: {
    border: "border-l-blue-500",
    badge: "bg-blue-500/10 border-blue-500/20",
    text: "text-blue-400",
  },
  RECURSA: {
    border: "border-l-rose-500",
    badge: "bg-rose-500/10 border-rose-500/20",
    text: "text-rose-400",
  },
  PENDIENTE: {
    border: "border-l-slate-700",
    badge: "bg-slate-800/40 border-slate-700/30",
    text: "text-slate-400",
  },
};

export function MateriaCard({ materia }: { materia: Materia }) {
  const config = SITUACION_COLORS[materia.situacion] ?? {
    border: "border-l-slate-700",
    badge: "bg-slate-800/40 border-slate-700/30",
    text: "text-slate-400",
  };

  return (
    <div
      className={`group flex items-center justify-between gap-4 rounded-xl border-y border-r border-slate-900 border-l-4 ${config.border} bg-slate-900/20 px-4.5 py-4.5 backdrop-blur-sm transition-all duration-300 hover:bg-slate-800/30 hover:border-slate-800 hover:shadow-[0_4px_20px_rgba(0,0,0,0.15)]`}
    >
      <div className="min-w-0 flex-1">
        <p className="font-bold text-slate-100 group-hover:text-sky-400 transition-colors leading-snug">
          {materia.nombre}
        </p>
        
        {/* Metadatos con mini-iconos o etiquetas sutiles */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 font-semibold mt-1.5">
          <span className="font-mono text-slate-600 group-hover:text-slate-500 transition-colors">
            {materia.codigo}
          </span>
          <span className="text-slate-800">•</span>
          <span className="flex items-center gap-1">
            <svg className="h-3 w-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {materia.horas} Hs
          </span>
          <span className="text-slate-800">•</span>
          <span className="flex items-center gap-1">
            <svg className="h-3 w-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Cuatrimestre {materia.cuatrimestre}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3.5">
        {materia.nota != null && (
          <div className="rounded-lg bg-slate-950/50 border border-slate-900 px-2.5 py-1.5 text-xs font-bold text-slate-300">
            Nota: <span className="text-sky-400">{materia.nota}</span>
          </div>
        )}
        
        <span
          className={`rounded-lg border px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide ${config.badge} ${config.text}`}
        >
          {LABEL_SITUACION[materia.situacion]}
        </span>
      </div>
    </div>
  );
}
