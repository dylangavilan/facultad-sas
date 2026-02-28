"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

export const MateriaNodeObsidian = memo(function MateriaNodeObsidian({
  data,
  selected,
}: NodeProps) {
  const color = (data.color as string) ?? "#c084fc";
  const label = (data.label as string) ?? "";

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all ${
          selected ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900" : ""
        }`}
        style={{ backgroundColor: color }}
      />
      <span className="max-w-[100px] truncate text-sm font-medium text-slate-200">
        {label}
      </span>
      <Handle
        type="target"
        position={Position.Left}
        className="!-left-1 !h-2 !w-2 !border-0 !bg-transparent"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!-right-1 !h-2 !w-2 !border-0 !bg-transparent"
      />
    </div>
  );
});
