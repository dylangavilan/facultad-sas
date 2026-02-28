"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

export const MateriaNode = memo(function MateriaNode({
  data,
  selected,
}: NodeProps) {
  const color = (data.color as string) ?? "#9ca3af";
  const codigo = (data.codigo as string) ?? "";
  const label = (data.label as string) ?? "";
  const situacion = (data.situacion as string) ?? "";
  const nota = data.nota as number | undefined;

  return (
    <div
      className={`rounded-lg border-2 px-4 py-2 shadow-sm transition-all ${
        selected ? "ring-2 ring-blue-400 ring-offset-2" : ""
      }`}
      style={{
        borderColor: color,
        backgroundColor: "white",
        minWidth: 180,
      }}
    >
      <p className="text-xs font-mono text-notion-text-secondary">{codigo}</p>
      <p className="mt-0.5 truncate text-sm font-medium text-notion-text">
        {label}
      </p>
      <div className="mt-1 flex items-center gap-2 text-xs text-notion-text-secondary">
        <span
          className="rounded px-1.5 py-0.5 font-medium"
          style={{ backgroundColor: `${color}30`, color }}
        >
          {situacion.replace("_", " ")}
        </span>
        {nota != null && <span>Nota: {nota}</span>}
      </div>
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !border-2" style={{ borderColor: color, backgroundColor: "white" }} />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !border-2" style={{ borderColor: color, backgroundColor: "white" }} />
    </div>
  );
});
