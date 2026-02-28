import { Position, type Node, type Edge } from "@xyflow/react";
import type { Materia } from "@/types/historial";

const AÑO_ORDER: Record<string, number> = {
  PRIMER_AÑO: 0,
  SEGUNDO_AÑO: 1,
  TERCER_AÑO: 2,
  CUARTO_AÑO: 3,
  QUINTO_AÑO: 4,
  OPTATIVAS: 5,
  ANEXO: 6,
};

const LAYER_WIDTH = 280;
const LAYER_HEIGHT = 120;

function getSituacionColor(situacion: string): string {
  switch (situacion) {
    case "PROMOCIONA":
    case "APROBADO":
    case "EQUIV_INTERNA":
      return "#22c55e";
    case "A_FINAL":
    case "INSCRIPTO":
      return "#f59e0b";
    case "RECURSA":
      return "#ef4444";
    default:
      return "#9ca3af";
  }
}

export function materiasToFlowData(materias: Materia[]): {
  nodes: Node[];
  edges: Edge[];
} {
  const byCodigo = new Map(materias.map((m) => [m.codigo, m]));
  const byAño = new Map<string, Materia[]>();

  for (const m of materias) {
    const list = byAño.get(m.año) ?? [];
    list.push(m);
    byAño.set(m.año, list);
  }

  const añosOrdenados = Array.from(byAño.keys()).sort(
    (a, b) => (AÑO_ORDER[a] ?? 99) - (AÑO_ORDER[b] ?? 99)
  );

  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const seenEdges = new Set<string>();

  añosOrdenados.forEach((año, layerIndex) => {
    const list = byAño.get(año) ?? [];
    list.forEach((m, i) => {
      const x = layerIndex * LAYER_WIDTH + 50;
      const y = i * LAYER_HEIGHT + 40;

      nodes.push({
        id: m.codigo,
        type: "materiaNode",
        position: { x, y },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          label: m.nombre,
          codigo: m.codigo,
          situacion: m.situacion,
          nota: m.nota,
          horas: m.horas,
          color: getSituacionColor(m.situacion),
        },
      });

      (m.correlativas ?? []).forEach((codCorr) => {
        if (!byCodigo.has(codCorr)) return;
        const edgeKey = `${codCorr}-${m.codigo}`;
        if (seenEdges.has(edgeKey)) return;
        seenEdges.add(edgeKey);
        const edgeColor = getSituacionColor(m.situacion);
        edges.push({
          id: edgeKey,
          source: codCorr,
          target: m.codigo,
          type: "smoothstep",
          animated: true,
          style: {
            stroke: edgeColor,
            strokeWidth: 2.5,
          },
          zIndex: 0,
        });
      });
    });
  });

  return { nodes, edges };
}

/** Filtra el grafo para mostrar solo el nodo seleccionado + sus correlativas (anteriores y siguientes) */
export function filterGraphByNode(
  nodes: Node[],
  edges: Edge[],
  nodeId: string
): { nodes: Node[]; edges: Edge[] } {
  const nodeIds = new Set<string>([nodeId]);

  edges.forEach((e) => {
    if (e.source === nodeId || e.target === nodeId) {
      nodeIds.add(e.source);
      nodeIds.add(e.target);
    }
  });

  const filteredNodes = nodes.filter((n) => nodeIds.has(n.id));
  const filteredEdges = edges.filter(
    (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
  );

  return { nodes: filteredNodes, edges: filteredEdges };
}
