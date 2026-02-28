"use client";

import type { ResumenMaterias } from "@/lib/historial";

interface ResumenStatsProps {
  resumen: ResumenMaterias;
}

export function ResumenStats({ resumen }: ResumenStatsProps) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="rounded-lg border border-notion-border bg-white px-4 py-3">
        <p className="text-2xl font-semibold text-green-600">
          {resumen.aprobadas}
        </p>
        <p className="text-sm text-notion-text-secondary">Aprobadas</p>
      </div>
      <div className="rounded-lg border border-notion-border bg-white px-4 py-3">
        <p className="text-2xl font-semibold text-amber-600">
          {resumen.aFinalPrevio}
        </p>
        <p className="text-sm text-notion-text-secondary">A final previo</p>
      </div>
      <div className="rounded-lg border border-notion-border bg-white px-4 py-3">
        <p className="text-2xl font-semibold text-notion-text">
          {resumen.pendientes}
        </p>
        <p className="text-sm text-notion-text-secondary">Pendientes</p>
      </div>
    </div>
  );
}
