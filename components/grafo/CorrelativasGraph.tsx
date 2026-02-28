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
import { MateriaNodeObsidian } from "./MateriaNodeObsidian";
import {
  materiasToFlowData,
  filterGraphByNode,
  applyDagreLayout,
} from "@/lib/graphUtils";
import type { Materia } from "@/types/historial";

const nodeTypes = {
  materiaNode: MateriaNode,
  materiaNodeObsidian: MateriaNodeObsidian,
};

interface CorrelativasGraphProps {
  materias: Materia[];
}

function CorrelativasGraphInner({ materias }: CorrelativasGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [filterActive, setFilterActive] = useState(false);
  const [obsidianMode, setObsidianMode] = useState(false);

  const fullData = useMemo(
    () => materiasToFlowData(materias, obsidianMode),
    [materias, obsidianMode]
  );

  const processedData = useMemo(() => {
    const { nodes: n, edges: e } = fullData;
    const nodeType = obsidianMode ? "materiaNodeObsidian" : "materiaNode";
    const typedNodes = n.map((node) => ({ ...node, type: nodeType }));
    if (obsidianMode) {
      return {
        nodes: applyDagreLayout(typedNodes, e, "LR"),
        edges: e,
      };
    }
    return { nodes: typedNodes, edges: e };
  }, [fullData, obsidianMode]);

  useEffect(() => {
    if (filterActive && selectedNodeId) {
      const { nodes: n, edges: e } = filterGraphByNode(
        processedData.nodes,
        processedData.edges,
        selectedNodeId
      );
      const nodesWithSelection = n.map((node) => ({
        ...node,
        selected: node.id === selectedNodeId,
      }));
      const filteredNodes = obsidianMode
        ? applyDagreLayout(nodesWithSelection, e, "LR")
        : nodesWithSelection;
      setNodes(filteredNodes);
      setEdges(e);
    } else {
      setNodes(processedData.nodes);
      setEdges(processedData.edges);
    }
  }, [processedData, filterActive, selectedNodeId, obsidianMode, setNodes, setEdges]);

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
        <p className="text-notion-text-secondary">
          No hay materias para mostrar.
        </p>
      </div>
    );
  }

  const showPanel = Boolean(selectedNodeId || filterActive);

  return (
    <div
      className={`relative h-[600px] rounded-lg border ${
        obsidianMode
          ? "border-slate-700 bg-slate-900"
          : "border-notion-border bg-white"
      }`}
    >
      <div className="absolute right-4 top-4 z-[1000]">
        <button
          type="button"
          onClick={() => setObsidianMode(!obsidianMode)}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            obsidianMode
              ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
              : "border border-notion-border bg-white text-notion-text hover:bg-gray-50"
          }`}
          title={obsidianMode ? "Vista estándar" : "Vista Obsidian"}
        >
          {obsidianMode ? "Vista estándar" : "Vista Obsidian"}
        </button>
      </div>
      {showPanel && (
        <div
          className={`absolute left-4 top-4 z-[1000] flex items-center gap-3 rounded-lg px-4 py-2.5 shadow-md ${
            obsidianMode
              ? "border border-slate-600 bg-slate-800"
              : "border border-notion-border bg-white"
          }`}
        >
          <span
            className={`text-sm ${
              obsidianMode ? "text-slate-400" : "text-notion-text-secondary"
            }`}
          >
            {filterActive ? (
              <>
                Viendo conexiones de{" "}
                <strong
                  className={obsidianMode ? "text-slate-100" : "text-notion-text"}
                >
                  {selectedNodeName ?? "materia"}
                </strong>
              </>
            ) : selectedNodeName ? (
              <>
                Seleccionada:{" "}
                <strong
                  className={obsidianMode ? "text-slate-100" : "text-notion-text"}
                >
                  {selectedNodeName}
                </strong>
              </>
            ) : null}
          </span>
          {filterActive ? (
            <button
              type="button"
              onClick={handleClearFilter}
              className="rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
            >
              Mostrar todo
            </button>
          ) : selectedNodeId ? (
            <button
              type="button"
              onClick={handleApplyFilter}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                obsidianMode
                  ? "border border-slate-600 bg-slate-700 text-slate-200 hover:bg-slate-600"
                  : "border border-notion-border bg-white text-notion-text hover:bg-gray-50"
              }`}
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
          style: { strokeWidth: obsidianMode ? 1 : 2.5 },
        }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        attributionPosition="bottom-left"
        colorMode={obsidianMode ? "dark" : "light"}
      >
        <Background
          color={obsidianMode ? "#334155" : "#e5e7eb"}
          gap={obsidianMode ? 20 : 16}
        />
        <Controls
          className={
            obsidianMode
              ? "!bg-slate-800 !border-slate-600 [&>button]:!bg-slate-700 [&>button]:!text-slate-200 [&>button:hover]:!bg-slate-600"
              : ""
          }
        />
        <MiniMap
          nodeColor={(n) => (n.data.color as string) ?? "#9ca3af"}
          maskColor={obsidianMode ? "rgba(15,23,42,0.8)" : "rgba(0,0,0,0.05)"}
          className={obsidianMode ? "!bg-slate-800" : ""}
        />
      </ReactFlow>
    </div>
  );
}

export function CorrelativasGraph(props: CorrelativasGraphProps) {
  return <CorrelativasGraphInner {...props} />;
}
