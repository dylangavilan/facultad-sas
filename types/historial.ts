export interface Student {
  nombre: string;
  lu: string;
  plan: string;
  planCodigo: string;
  documento?: string;
  fechaNacimiento?: string;
}

export type Situacion =
  | "PROMOCIONA"
  | "APROBADO"
  | "RECURSA"
  | "INSCRIPTO"
  | "A_FINAL"
  | "EQUIV_INTERNA"
  | "PENDIENTE";

export type Anio =
  | "PRIMER_AÑO"
  | "SEGUNDO_AÑO"
  | "TERCER_AÑO"
  | "CUARTO_AÑO"
  | "QUINTO_AÑO"
  | "OPTATIVAS"
  | "ANEXO";

export interface Materia {
  codigo: string;
  nombre: string;
  horas: number;
  situacion: Situacion;
  nota?: number;
  año: Anio;
  correlativas?: string[];
}

export interface HistorialResponse {
  student: Student;
  materias: Materia[];
}
