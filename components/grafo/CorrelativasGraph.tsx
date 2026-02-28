"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { MateriaNode } from "./MateriaNode";
import {
  materiasToFlowData,
  filterGraphByNode,
} from "@/lib/graphUtils";
import type { Materia } from "@/types/historial";

const nodeTypes = { materiaNode: MateriaNode };

interface CorrelativasGraphProps {
  materias: Materia[];
}

function CorrelativasGraphInner({ materias }: CorrelativasGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [filterActive, setFilterActive] = useState(false);

  const fullData = useMemo(
    () => materiasToFlowData(materias),
    [materias]
  );

  useEffect(() => {
    if (filterActive && selectedNodeId) {
      const { nodes: n, edges: e } = filterGraphByNode(
        fullData.nodes,
        fullData.edges,
        selectedNodeId
      );
      const nodesWithSelection = n.map((node) => ({
        ...node,
        selected: node.id === selectedNodeId,
      }));
      setNodes(nodesWithSelection);
      setEdges(e);
    } else {
      setNodes(fullData.nodes);
      setEdges(fullData.edges);
    }
  }, [fullData, filterActive, selectedNodeId, setNodes, setEdges]);

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: Node[]; edges: Edge[] }) => {
      const id = selectedNodes.length === 1 ? selectedNodes[0].id : null;
      setSelectedNodeId(id);
      if (id === null && !filterActive) setFilterActive(false);
    },
    [filterActive]
  );

  const selectedNodeName = useMemo(() => {
    if (!selectedNodeId) return null;
    const node = fullData.nodes.find((n) => n.id === selectedNodeId);
    return (node?.data?.label as string) ?? selectedNodeId;
  }, [selectedNodeId, fullData.nodes]);

  const handleApplyFilter = useCallback(() => {
    if (selectedNodeId) setFilterActive(true);
  }, [selectedNodeId]);

  const handleClearFilter = useCallback(() => setFilterActive(false), []);

  if (materias.length === 0) {
    return (
      <div className="flex h-[600px] items-center justify-center rounded-lg border border-notion-border bg-white">
        <p className="text-notion-text-secondary">No hay materias para mostrar.</p>
      </div>
    );
  }

  const showPanel = Boolean(selectedNodeId || filterActive);

  return (
    <div className="relative h-[600px] rounded-lg border border-notion-border bg-white">
      {showPanel && (
        <div className="absolute left-4 top-4 z-[1000] flex items-center gap-3 rounded-lg border border-notion-border bg-white px-4 py-2.5 shadow-md">
          <span className="text-sm text-notion-text-secondary">
            {filterActive ? (
              <>
                Viendo conexiones de{" "}
                <strong className="text-notion-text">
                  {selectedNodeName ?? "materia"}
                </strong>
              </>
            ) : selectedNodeName ? (
              <>
                Seleccionada:{" "}
                <strong className="text-notion-text">{selectedNodeName}</strong>
              </>
            ) : null}
          </span>
          {filterActive ? (
            <button
              type="button"
              onClick={handleClearFilter}
              className="rounded-md bg-notion-text px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-notion-text/90"
            >
              Mostrar todo
            </button>
          ) : selectedNodeId ? (
            <button
              type="button"
              onClick={handleApplyFilter}
              className="rounded-md border border-notion-border bg-white px-3 py-1.5 text-sm font-medium text-notion-text transition-colors hover:bg-gray-50"
            >
              Ver solo correlativas
            </button>
          ) : null}
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{
          style: { strokeWidth: 2.5 },
        }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(n) => (n.data.color as string) ?? "#9ca3af"}
          maskColor="rgba(0,0,0,0.05)"
        />
      </ReactFlow>
    </div>
  );
}

export function CorrelativasGraph(props: CorrelativasGraphProps) {
  return <CorrelativasGraphInner {...props} />;
}
