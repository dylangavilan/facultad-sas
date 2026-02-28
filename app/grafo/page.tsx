import dynamic from "next/dynamic";
import { getHistorial } from "@/lib/historial";
import { StudentHeader } from "@/components/historial/StudentHeader";

const CorrelativasGraph = dynamic(
  () =>
    import("@/components/grafo/CorrelativasGraph").then((m) => ({
      default: m.CorrelativasGraph,
    })),
  { ssr: false }
);

export default function GrafoPage() {
  const { student, materias } = getHistorial();

  return (
    <>
      <StudentHeader student={student} />
      <div className="mb-4 text-sm text-notion-text-secondary">
        Vista de correlativas: cada flecha indica que la materia de origen es
        prerrequisito de la materia de destino. Hacé clic en una materia para
        seleccionarla y ver solo sus correlativas.
      </div>
      <CorrelativasGraph materias={materias} />
    </>
  );
}
