import type { Student } from "@/types/historial";

export function StudentHeader({ student }: { student: Student }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-semibold text-notion-text">
        Historial Académico
      </h1>
      <p className="mt-1 text-sm text-notion-text-secondary">
        {student.nombre} · LU {student.lu} · {student.plan}
      </p>
    </div>
  );
}
