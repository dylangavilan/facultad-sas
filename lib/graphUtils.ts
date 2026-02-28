import dagre from "@dagrejs/dagre";
import { Position, type Node, type Edge } from "@xyflow/react";
import type { Materia } from "@/types/historial";

export const OBSIDIAN_NODE_WIDTH = 140;
export const OBSIDIAN_NODE_HEIGHT = 32;

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

export function applyDagreLayout(
  nodes: Node[],
  edges: Edge[],
  direction: "TB" | "LR" = "LR"
): Node[] {
  dagreGraph.setGraph({ rankdir: direction, nodesep: 40, ranksep: 60 });
  const isHorizontal = direction === "LR";

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: OBSIDIAN_NODE_WIDTH,
      height: OBSIDIAN_NODE_HEIGHT,
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const pos = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - OBSIDIAN_NODE_WIDTH / 2,
        y: pos.y - OBSIDIAN_NODE_HEIGHT / 2,
      },
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
    };
  });
}

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

function getSituacionColor(situacion: string, obsidian = false): string {
  if (obsidian) {
    switch (situacion) {
      case "PROMOCIONA":
      case "APROBADO":
      case "EQUIV_INTERNA":
        return "#4ade80";
      case "A_FINAL":
      case "INSCRIPTO":
        return "#fbbf24";
      case "RECURSA":
        return "#f472b6";
      default:
        return "#c084fc";
    }
  }
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

export function materiasToFlowData(
  materias: Materia[],
  obsidian = false
): { nodes: Node[]; edges: Edge[] } {
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
          color: getSituacionColor(m.situacion, obsidian),
          obsidian,
        },
      });

      (m.correlativas ?? []).forEach((codCorr) => {
        if (!byCodigo.has(codCorr)) return;
        const edgeKey = `${codCorr}-${m.codigo}`;
        if (seenEdges.has(edgeKey)) return;
        seenEdges.add(edgeKey);
        const edgeColor = getSituacionColor(m.situacion, obsidian);
        edges.push({
          id: edgeKey,
          source: codCorr,
          target: m.codigo,
          type: "smoothstep",
          animated: !obsidian,
          style: {
            stroke: obsidian ? "#64748b" : edgeColor,
            strokeWidth: obsidian ? 1 : 2.5,
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
