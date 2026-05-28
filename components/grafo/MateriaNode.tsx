"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

export const MateriaNode = memo(function MateriaNode({
  data,
  selected,
}: NodeProps) {
  const color = (data.color as string) ?? "#64748b";
  const codigo = (data.codigo as string) ?? "";
  const label = (data.label as string) ?? "";
  const situacion = (data.situacion as string) ?? "";
  const nota = data.nota as number | undefined;

  return (
    <div
      className={`rounded-lg border-2 px-3 py-2 transition-all duration-300 w-full h-full flex flex-col justify-between ${
        selected
          ? "shadow-[0_0_20px_rgba(56,189,248,0.3)] scale-[1.03] ring-2 ring-sky-400/50"
          : "shadow-md hover:shadow-lg hover:scale-[1.01]"
      }`}
      style={{
        borderColor: selected ? "#38bdf8" : color,
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        backdropFilter: "blur(10px)",
        maxWidth: 200,
      }}
    >
      <div className="flex-1 flex flex-col">
        <span className="text-[9px] font-bold font-mono text-slate-400 tracking-wider truncate">
          {codigo}
        </span>

        <p className="mt-1.5 text-[11px] font-bold text-slate-100 leading-tight line-clamp-2">
          {label}
        </p>
      </div>

      <div className="mt-2 flex flex-col gap-1">
        <div className="flex items-center justify-between gap-1">
          <span
            className="rounded px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wide border flex-1 text-center"
            style={{
              backgroundColor: `${color}20`,
              borderColor: `${color}40`,
              color
            }}
          >
            {situacion.replace(/_/g, " ").length > 12
              ? situacion.replace(/_/g, " ").substring(0, 10) + "..."
              : situacion.replace(/_/g, " ")}
          </span>
          {nota != null && (
            <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[8px] font-extrabold text-sky-300 border border-sky-500/30 whitespace-nowrap">
              {nota}
            </span>
          )}
        </div>
        <span className="text-[8px] font-semibold text-slate-500 text-center">
          Cuatrimestre {data.cuatrimestre as number}
        </span>
      </div>

      <Handle 
        type="target" 
        position={Position.Left} 
        className="!w-2.5 !h-2.5 !border-2 !transition-transform hover:scale-125" 
        style={{ borderColor: color, backgroundColor: "#0b0f19" }} 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="!w-2.5 !h-2.5 !border-2 !transition-transform hover:scale-125" 
        style={{ borderColor: color, backgroundColor: "#0b0f19" }} 
      />
    </div>
  );
});
