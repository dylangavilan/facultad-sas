import dagre from "@dagrejs/dagre";
import { Position, type Node, type Edge } from "@xyflow/react";
import type { Materia } from "@/types/historial";

export const OBSIDIAN_NODE_WIDTH = 160;
export const OBSIDIAN_NODE_HEIGHT = 40;
export const GRID_NODE_WIDTH = 200;
export const GRID_NODE_HEIGHT = 120;

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

// Grid layout: 5 materias por cuatrimestre
const COLS_PER_CUATRIMESTRE = 5;
const CELL_WIDTH = 220;        // Ancho de cada celda
const CELL_HEIGHT = 130;       // Alto de cada celda
const CUATRIMESTRE_GAP = 280;  // Espacio entre cuatrimestres horizontalmente
const YEAR_GAP = 700;          // Espacio entre años horizontalmente
const YEAR_HEIGHT = 350;       // Alto asignado a cada año

const SITUACION_COLOR: Record<string, string> = {
  PROMOCIONA: "#10b981",       // Esmeralda
  APROBADO: "#10b981",
  EQUIV_INTERNA: "#10b981",
  A_FINAL: "#f59e0b",          // Ámbar
  INSCRIPTO: "#3b82f6",        // Azul
  RECURSA: "#ef4444",          // Rojo
};

const SITUACION_COLOR_OBSIDIAN: Record<string, string> = {
  PROMOCIONA: "#34d399",       // Esmeralda brillante
  APROBADO: "#34d399",
  EQUIV_INTERNA: "#34d399",
  A_FINAL: "#fbbf24",          // Ámbar brillante
  INSCRIPTO: "#60a5fa",        // Azul brillante
  RECURSA: "#f87171",          // Rojo brillante
};

const DEFAULT_COLOR = "#64748b"; // Gris pizarra
const DEFAULT_COLOR_OBSIDIAN = "#a78bfa"; // Violeta para optativas en Obsidian

function getSituacionColor(situacion: string, obsidian = false): string {
  const map = obsidian ? SITUACION_COLOR_OBSIDIAN : SITUACION_COLOR;
  return map[situacion] ?? (obsidian ? DEFAULT_COLOR_OBSIDIAN : DEFAULT_COLOR);
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

  añosOrdenados.forEach((año, yearIndex) => {
    const list = (byAño.get(año) ?? []).sort(
      (a, b) =>
        a.cuatrimestre - b.cuatrimestre ||
        a.nombre.localeCompare(b.nombre, "es")
    );

    // Separar por cuatrimestre
    const byC = new Map<number, Materia[]>();
    for (const m of list) {
      const c = m.cuatrimestre;
      if (!byC.has(c)) byC.set(c, []);
      byC.get(c)!.push(m);
    }

    // Posicionar en grid: 5 columnas por cuatrimestre
    let yearOffset = yearIndex * YEAR_GAP;
    let maxYForYear = 0;

    [1, 2].forEach((c) => {
      const cuatrimestraMateria = byC.get(c) ?? [];
      const xBase = yearOffset + (c === 1 ? 0 : CUATRIMESTRE_GAP);

      cuatrimestraMateria.forEach((m, index) => {
        const col = index % COLS_PER_CUATRIMESTRE;
        const row = Math.floor(index / COLS_PER_CUATRIMESTRE);

        const x = xBase + col * CELL_WIDTH;
        const y = row * CELL_HEIGHT;
        maxYForYear = Math.max(maxYForYear, y);

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
            cuatrimestre: m.cuatrimestre,
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
            animated: !obsidian && ["A_FINAL", "INSCRIPTO"].includes(m.situacion),
            style: {
              stroke: obsidian ? "#334155" : `${edgeColor}a5`,
              strokeWidth: obsidian ? 1.5 : 3.5,
            },
            zIndex: 0,
          });
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
