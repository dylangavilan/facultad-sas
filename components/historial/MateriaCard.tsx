import type { Materia } from "@/types/historial";
import { LABEL_SITUACION } from "@/lib/historial";

const SITUACION_STYLES: Record<string, string> = {
  PROMOCIONA: "bg-green-100 text-green-800",
  APROBADO: "bg-green-50 text-green-700",
  EQUIV_INTERNA: "bg-emerald-50 text-emerald-700",
  A_FINAL: "bg-amber-50 text-amber-700",
  INSCRIPTO: "bg-amber-50 text-amber-700",
  RECURSA: "bg-red-50 text-red-700",
  PENDIENTE: "bg-gray-100 text-gray-600",
};

export function MateriaCard({ materia }: { materia: Materia }) {
  const style = SITUACION_STYLES[materia.situacion] ?? "bg-gray-100 text-gray-600";

  return (
    <div className="flex items-center gap-4 rounded-lg border border-notion-border bg-white px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-notion-text">{materia.nombre}</p>
        <p className="text-sm text-notion-text-secondary">
          {materia.codigo} · {materia.horas} Hs
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {materia.nota != null && (
          <span className="text-sm font-medium text-notion-text">
            Nota: {materia.nota}
          </span>
        )}
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
        >
          {LABEL_SITUACION[materia.situacion]}
        </span>
      </div>
    </div>
  );
}
