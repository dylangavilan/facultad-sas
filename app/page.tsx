import { getHistorial } from "@/lib/historial";
import { HomePage } from "@/components/home/HomePage";

export default function Page() {
  const { student, materias } = getHistorial();
  return <HomePage student={student} materias={materias} />;
}
