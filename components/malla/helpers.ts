import type { Materia, Situacion } from "@/types/historial";

export const APPROVED_STATUSES = new Set<Situacion>([
  "APROBADO",
  "PROMOCIONA",
  "EQUIV_INTERNA",
]);

export const NOTA_STATUSES = new Set<Situacion>(["APROBADO", "PROMOCIONA"]);

export const STATUS_META = {
  PROMOCIONA:    { label: "Promocionada", varName: "--st-promociona", order: 0 },
  APROBADO:      { label: "Aprobada",     varName: "--st-aprobado",   order: 1 },
  EQUIV_INTERNA: { label: "Equivalencia", varName: "--st-equiv",      order: 2 },
  INSCRIPTO:     { label: "Cursando",     varName: "--st-inscripto",  order: 3 },
  A_FINAL:       { label: "A final",      varName: "--st-afinal",     order: 4 },
  RECURSA:       { label: "Recursa",      varName: "--st-recursa",    order: 5 },
  PENDIENTE:     { label: "Pendiente",    varName: "--st-pendiente",  order: 6 },
} as const;

const LOWER_WORDS = new Set(["de", "del", "y", "a", "e", "en", "la", "el", "las", "los"]);
const ROMAN_RE = /^(i{1,3}|iv|vi{0,3}|ix|x)\.?$/i;

export function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(/(\s+)/)
    .map((word, i) => {
      if (!word || /^\s+$/.test(word)) return word;
      if (ROMAN_RE.test(word.replace(/\.$/, ""))) return word.toUpperCase();
      if (i > 0 && LOWER_WORDS.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join("");
}

const STOP_CODE = new Set(["DE", "DEL", "Y", "A", "E", "EN", "LA", "EL", "LAS", "LOS"]);
const ROMAN_MAP: Record<string, string> = {
  I: "1", II: "2", III: "3", IV: "4", V: "5", VI: "6",
};

export function shortCode(nombre: string): string {
  const ascii = nombre.normalize("NFD").replace(/[̀-ͯ]/g, "");
  const cleaned = ascii.toUpperCase().replace(/[.,]/g, "");
  const words = cleaned.split(/\s+/).filter((w) => w && !STOP_CODE.has(w));
  const parts: string[] = [];
  for (const w of words) {
    if (ROMAN_MAP[w]) parts.push(ROMAN_MAP[w]);
    else parts.push(w[0]);
  }
  let code = parts.join("");
  if (code.length < 2 || code.length > 4) {
    code = (words[0] || ascii).slice(0, 3);
  }
  return code.slice(0, 4);
}

export type Bucket = "done" | "active" | "available" | "blocked";

export interface MateriaWithFlags extends Materia {
  _faded: boolean;
  _blocked: boolean;
  _blockedBy: string[];
}

export function bucketOf(m: MateriaWithFlags): Bucket {
  if (APPROVED_STATUSES.has(m.situacion)) return "done";
  if (["INSCRIPTO", "A_FINAL", "RECURSA"].includes(m.situacion)) return "active";
  return m._blocked ? "blocked" : "available";
}

export interface SharedCardProps {
  related: { prereqs: Set<string>; dependents: Set<string> };
  hoveredId: string | null;
  selectedId: string | null;
  registerRef: (code: string, el: HTMLDivElement | null) => void;
  onHover: (id: string) => void;
  onLeave: () => void;
  onSelect: (id: string) => void;
}

const YEAR_LABELS: Record<string, string> = {
  PRIMER_AÑO:  "Primer año",
  SEGUNDO_AÑO: "Segundo año",
  TERCER_AÑO:  "Tercer año",
  CUARTO_AÑO:  "Cuarto año",
  QUINTO_AÑO:  "Quinto año",
  OPTATIVAS:   "Optativas",
  ANEXO:       "Anexo",
};
const YEAR_ORDER = [
  "PRIMER_AÑO", "SEGUNDO_AÑO", "TERCER_AÑO",
  "CUARTO_AÑO", "QUINTO_AÑO", "OPTATIVAS", "ANEXO",
];

export interface SubColData {
  id: string;
  label: string;
  items: MateriaWithFlags[];
}

export interface YearGroupData {
  id: string;
  label: string;
  kind: "regular" | "extra";
  items: MateriaWithFlags[];
  cols: SubColData[];
}

export function buildYearGroups(materias: MateriaWithFlags[]): YearGroupData[] {
  const groups: YearGroupData[] = [];
  for (const y of YEAR_ORDER) {
    if (y === "OPTATIVAS" || y === "ANEXO") continue;
    const items = materias.filter((m) => m.año === y);
    if (!items.length) continue;
    groups.push({
      id: y,
      label: YEAR_LABELS[y],
      kind: "regular",
      items,
      cols: [
        { id: `${y}-1`, label: "1° Cuatrimestre", items: items.filter((m) => m.cuatrimestre === 1) },
        { id: `${y}-2`, label: "2° Cuatrimestre", items: items.filter((m) => m.cuatrimestre === 2) },
      ],
    });
  }
  const opt = materias.filter((m) => m.año === "OPTATIVAS");
  const anx = materias.filter((m) => m.año === "ANEXO");
  if (opt.length || anx.length) {
    const cols: SubColData[] = [];
    if (opt.length) cols.push({ id: "OPT", label: "Optativas", items: opt });
    if (anx.length) cols.push({ id: "ANX", label: "Anexo", items: anx });
    groups.push({
      id: "EXTRAS",
      label: "Extras",
      kind: "extra",
      items: [...opt, ...anx],
      cols,
    });
  }
  return groups;
}

export interface Stats {
  total: number;
  approvedCount: number;
  avg: number;
  horasAprob: number;
  byStatus: Record<string, number>;
  available: number;
  blocked: number;
  withGradeCount: number;
}

export function computeStats(materias: Materia[]): Stats {
  const total = materias.length;
  const approved = materias.filter((m) => APPROVED_STATUSES.has(m.situacion));
  const withGrade = approved.filter((m) => typeof m.nota === "number");
  const avg = withGrade.length
    ? withGrade.reduce((a, m) => a + (m.nota ?? 0), 0) / withGrade.length
    : 0;
  const horasAprob = approved.reduce((a, m) => a + m.horas, 0);

  const byStatus: Record<string, number> = {};
  for (const k of Object.keys(STATUS_META)) byStatus[k] = 0;
  for (const m of materias) byStatus[m.situacion] = (byStatus[m.situacion] || 0) + 1;

  const byCode = Object.fromEntries(materias.map((m) => [m.codigo, m]));
  let available = 0;
  let blocked = 0;
  for (const m of materias) {
    if (m.situacion !== "PENDIENTE") continue;
    const allOk = (m.correlativas || []).every((c) => {
      const s = byCode[c];
      return s && APPROVED_STATUSES.has(s.situacion);
    });
    if (allOk) available++;
    else blocked++;
  }

  return {
    total,
    approvedCount: approved.length,
    avg,
    horasAprob,
    byStatus,
    available,
    blocked,
    withGradeCount: withGrade.length,
  };
}
