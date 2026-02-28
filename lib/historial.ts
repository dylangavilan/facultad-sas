import type { Materia, Situacion, HistorialResponse } from "@/types/historial";
import historialData from "@/data/historial.json";

export function isAprobada(situacion: Situacion): boolean {
  return ["PROMOCIONA", "APROBADO", "EQUIV_INTERNA"].includes(situacion);
}

export function isPendiente(situacion: Situacion): boolean {
  return !isAprobada(situacion);
}

export function isAFinal(situacion: Situacion): boolean {
  return situacion === "A_FINAL";
}

export interface ResumenMaterias {
  aprobadas: number;
  pendientes: number;
  aFinalPrevio: number;
}

export function contarMateriasPorSituacion(materias: Materia[]): ResumenMaterias {
  let aprobadas = 0;
  let aFinalPrevio = 0;
  let pendientes = 0;

  for (const m of materias) {
    if (isAprobada(m.situacion)) aprobadas++;
    else if (isAFinal(m.situacion)) aFinalPrevio++;
    else pendientes++;
  }

  return { aprobadas, pendientes, aFinalPrevio };
}

export function filtrarMaterias(
  materias: Materia[],
  filter: "aprobadas" | "pendientes" | "todas"
): Materia[] {
  if (filter === "aprobadas") {
    return materias.filter((m) => isAprobada(m.situacion));
  }
  if (filter === "pendientes") {
    return materias.filter((m) => isPendiente(m.situacion));
  }
  return materias;
}

export function getHistorial(
  filter?: "aprobadas" | "pendientes"
): HistorialResponse {
  const data = historialData as HistorialResponse;
  const materias = filter
    ? filtrarMaterias(data.materias, filter)
    : data.materias;
  return { student: data.student, materias };
}

export const LABEL_SITUACION: Record<Situacion, string> = {
  PROMOCIONA: "Promociona",
  APROBADO: "Aprobado",
  RECURSA: "Recursa",
  INSCRIPTO: "Inscripto",
  A_FINAL: "A final",
  EQUIV_INTERNA: "Equiv. interna",
  PENDIENTE: "Pendiente",
};

export const LABEL_AÑO: Record<string, string> = {
  PRIMER_AÑO: "Primer año",
  SEGUNDO_AÑO: "Segundo año",
  TERCER_AÑO: "Tercer año",
  CUARTO_AÑO: "Cuarto año",
  QUINTO_AÑO: "Quinto año",
  OPTATIVAS: "Optativas",
  ANEXO: "Anexo",
};
