import type { Materia } from "@/types/historial";
import { LABEL_AÑO } from "@/lib/historial";
import { MateriaCard } from "./MateriaCard";

function groupByAño(materias: Materia[]) {
  const groups = new Map<string, Materia[]>();
  const order = [
    "PRIMER_AÑO",
    "SEGUNDO_AÑO",
    "TERCER_AÑO",
    "CUARTO_AÑO",
    "QUINTO_AÑO",
    "OPTATIVAS",
    "ANEXO",
  ];
  for (const m of materias) {
    const list = groups.get(m.año) ?? [];
    list.push(m);
    groups.set(m.año, list);
  }
  return order.filter((a) => groups.has(a)).map((a) => ({ año: a, list: groups.get(a)! }));
}

export function HistorialTable({ materias }: { materias: Materia[] }) {
  const groups = groupByAño(materias);

  if (materias.length === 0) {
    return (
      <p className="rounded-lg border border-notion-border bg-white px-4 py-8 text-center text-notion-text-secondary">
        No hay materias para mostrar con el filtro seleccionado.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {groups.map(({ año, list }) => (
        <section key={año}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-notion-text-secondary">
            {LABEL_AÑO[año]}
          </h2>
          <div className="space-y-2">
            {list.map((m) => (
              <MateriaCard key={m.codigo} materia={m} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
