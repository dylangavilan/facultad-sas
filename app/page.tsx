import { getHistorial } from "@/lib/historial";
import { StudentHeader } from "@/components/historial/StudentHeader";
import { HistorialTable } from "@/components/historial/HistorialTable";
import { HistorialClient } from "@/components/historial/HistorialClient";

export default function HistorialPage() {
  const { student, materias } = getHistorial();

  return (
    <>
      <StudentHeader student={student} />
      <HistorialClient initialMaterias={materias} initialStudent={student} />
    </>
  );
}
