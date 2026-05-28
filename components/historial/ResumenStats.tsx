"use client";

import type { ResumenMaterias } from "@/lib/historial";

interface ResumenStatsProps {
  resumen: ResumenMaterias;
}

export function ResumenStats({ resumen }: ResumenStatsProps) {
  const total = resumen.aprobadas + resumen.pendientes + resumen.aFinalPrevio;
  const porcentajeAprobado = total > 0 ? Math.round((resumen.aprobadas / total) * 100) : 0;

  return (
    <div className="mb-6 space-y-4">
      {/* Barra de Progreso General */}
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/20 p-5 backdrop-blur-md">
        <div className="flex items-center justify-between text-sm font-semibold mb-2 px-1">
          <span className="text-slate-400">Progreso de la carrera</span>
          <span className="text-emerald-400 font-bold">{porcentajeAprobado}% Completado</span>
        </div>
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-950/80 border border-slate-900">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 transition-all duration-1000 ease-out"
            style={{ width: `${porcentajeAprobado}%` }}
          />
        </div>
      </div>

      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Aprobadas */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/15 bg-emerald-950/5 p-5 backdrop-blur-md transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.04)]">
          <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/5 rounded-full blur-2xl" />
          <span className="text-sm font-semibold text-slate-400 block">Aprobadas</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">
              {resumen.aprobadas}
            </span>
            <span className="text-xs text-slate-500">de {total} materias</span>
          </div>
        </div>

        {/* A final previo */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/15 bg-amber-950/5 p-5 backdrop-blur-md transition-all duration-300 hover:border-amber-500/30 hover:shadow-[0_0_20px_rgba(245,158,11,0.04)]">
          <div className="absolute top-0 right-0 h-16 w-16 bg-amber-500/5 rounded-full blur-2xl" />
          <span className="text-sm font-semibold text-slate-400 block">A final / Cursando</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-amber-400 tracking-tight">
              {resumen.aFinalPrevio}
            </span>
            <span className="text-xs text-slate-500">materias activas</span>
          </div>
        </div>

        {/* Pendientes */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/20 p-5 backdrop-blur-md transition-all duration-300 hover:border-slate-700/60 hover:shadow-[0_0_20px_rgba(148,163,184,0.02)]">
          <div className="absolute top-0 right-0 h-16 w-16 bg-slate-500/5 rounded-full blur-2xl" />
          <span className="text-sm font-semibold text-slate-400 block">Pendientes</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-300 tracking-tight">
              {resumen.pendientes}
            </span>
            <span className="text-xs text-slate-500">restantes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
