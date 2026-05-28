import type { Student } from "@/types/historial";

export function StudentHeader({ student }: { student: Student }) {
  // Obtener iniciales para el avatar
  const iniciales = student.nombre
    .split(",")
    .map((name) => name.trim().charAt(0))
    .reverse()
    .join("");

  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/35 p-6 backdrop-blur-md">
      {/* Detalle decorativo superior de color */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500" />
      
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4.5">
          {/* Avatar del estudiante */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30 text-lg font-bold text-sky-400 shadow-md">
            {iniciales}
          </div>
          
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Expediente Académico
            </span>
            <h1 className="text-xl font-extrabold text-slate-100 sm:text-2xl tracking-tight mt-0.5">
              {student.nombre}
            </h1>
            <p className="text-xs font-semibold text-slate-400 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>{student.plan}</span>
              <span className="text-slate-600">·</span>
              <span>Código: {student.planCodigo}</span>
            </p>
          </div>
        </div>
        
        {/* Detalles rápidos de legajo y documento */}
        <div className="flex flex-wrap gap-4 border-t border-slate-800/40 pt-4 sm:border-t-0 sm:pt-0">
          <div className="rounded-xl bg-slate-950/40 border border-slate-900/60 px-4 py-2">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">
              Legajo (LU)
            </span>
            <span className="text-sm font-bold text-sky-400 mt-0.5 block">
              {student.lu}
            </span>
          </div>
          
          <div className="rounded-xl bg-slate-950/40 border border-slate-900/60 px-4 py-2">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">
              Documento
            </span>
            <span className="text-sm font-semibold text-slate-300 mt-0.5 block">
              {student.documento}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
