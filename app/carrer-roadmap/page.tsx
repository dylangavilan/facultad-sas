import ingenieriaData from "@/data/historial.json";
import analistaData from "@/data/analista.json";
import type { HistorialResponse } from "@/types/historial";
import { PlanDeEstudios } from "@/components/malla/PlanDeEstudios";

export default function CarrerRoadmapPage() {
  const plans: HistorialResponse[] = [
    analistaData as unknown as HistorialResponse,
    ingenieriaData as unknown as HistorialResponse,
  ];
  return <PlanDeEstudios plans={plans} />;
}
