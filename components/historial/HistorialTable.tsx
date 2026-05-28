import type { Cuatrimestre, Materia } from "@/types/historial";
import { LABEL_AÑO, LABEL_CUATRIMESTRE } from "@/lib/historial";
import { MateriaCard } from "./MateriaCard";

function groupByAñoYCuatrimestre(materias: Materia[]) {
  const orderAño = [
    "PRIMER_AÑO",
    "SEGUNDO_AÑO",
    "TERCER_AÑO",
    "CUARTO_AÑO",
    "QUINTO_AÑO",
    "OPTATIVAS",
    "ANEXO",
  ];
  const byAño = new Map<string, Map<Cuatrimestre, Materia[]>>();

  for (const m of materias) {
    const cuatris = byAño.get(m.año) ?? new Map();
    const list = cuatris.get(m.cuatrimestre) ?? [];
    list.push(m);
    cuatris.set(m.cuatrimestre, list);
    byAño.set(m.año, cuatris);
  }

  return orderAño
    .filter((a) => byAño.has(a))
    .map((año) => {
      const cuatris = byAño.get(año)!;
      const cuatriOrder: Cuatrimestre[] = [1, 2];
      return {
        año,
        cuatris: cuatriOrder
          .filter((c) => cuatris.has(c))
          .map((cuatrimestre) => ({
            cuatrimestre,
            list: cuatris.get(cuatrimestre)!,
          })),
      };
    });
}

export function HistorialTable({ materias }: { materias: Materia[] }) {
  const groups = groupByAñoYCuatrimestre(materias);

  if (materias.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-900 bg-slate-900/10 px-4 py-12 text-center">
        <p className="text-sm font-medium text-slate-500">
          No hay materias para mostrar con el filtro seleccionado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {groups.map(({ año, cuatris }) => (
        <section key={año} className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-3 after:content-[''] after:h-px after:flex-1 after:bg-slate-900/80">
            {LABEL_AÑO[año]}
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {cuatris.map(({ cuatrimestre, list }) => (
              <div key={`${año}-${cuatrimestre}`} className="space-y-3">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-sky-400/70 border-b border-slate-900/60 pb-1.5">
                  {LABEL_CUATRIMESTRE[cuatrimestre]}
                </h3>
                <div className="space-y-3">
                  {list.map((m) => (
                    <MateriaCard key={m.codigo} materia={m} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
