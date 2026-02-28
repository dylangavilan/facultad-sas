"use client";

import { useEffect } from "react";
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
import { materiasToFlowData } from "@/lib/graphUtils";
import type { Materia } from "@/types/historial";

const nodeTypes = { materiaNode: MateriaNode };

interface CorrelativasGraphProps {
  materias: Materia[];
}

export function CorrelativasGraph({ materias }: CorrelativasGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    const { nodes: n, edges: e } = materiasToFlowData(materias);
    setNodes(n);
    setEdges(e);
  }, [materias, setNodes, setEdges]);

  if (materias.length === 0) {
    return (
      <div className="flex h-[600px] items-center justify-center rounded-lg border border-notion-border bg-white">
        <p className="text-notion-text-secondary">No hay materias para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="h-[600px] rounded-lg border border-notion-border bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{
          style: { strokeWidth: 2.5 },
        }}
        fitView
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
