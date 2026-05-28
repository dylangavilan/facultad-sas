"use client";

import { useMemo } from "react";
import { STATUS_META, type MateriaWithFlags } from "./helpers";

interface Position {
  left: number;
  right: number;
  top: number;
  bottom: number;
  midX: number;
  midY: number;
}

interface Props {
  materias: MateriaWithFlags[];
  positions: Record<string, Position>;
  hoveredId: string | null;
  related: { prereqs: Set<string>; dependents: Set<string> };
  statusColors: Record<string, string>;
}

export function EdgeLayer({ materias, positions, hoveredId, related, statusColors }: Props) {
  const edges = useMemo(() => {
    const out: {
      from: string;
      to: string;
      src: Position;
      dst: Position;
      dstStatus: string;
    }[] = [];
    for (const m of materias) {
      if (!m.correlativas) continue;
      const dst = positions[m.codigo];
      if (!dst) continue;
      for (const srcCode of m.correlativas) {
        const src = positions[srcCode];
        if (!src) continue;
        out.push({ from: srcCode, to: m.codigo, src, dst, dstStatus: m.situacion });
      }
    }
    return out;
  }, [materias, positions]);

  if (!edges.length) return null;

  const allPos = Object.values(positions);
  if (!allPos.length) return null;

  const width = Math.max(...allPos.map((p) => p.right), 0) + 4;
  const height = Math.max(...allPos.map((p) => p.bottom), 0) + 4;

  const chainNodes = hoveredId
    ? new Set([hoveredId, ...related.prereqs, ...related.dependents])
    : null;

  return (
    <svg
      className="edges"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        {Object.entries(STATUS_META).map(([k]) => (
          <marker
            key={k}
            id={`arr-${k}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 Z" fill={statusColors[k] || "#888"} />
          </marker>
        ))}
      </defs>
      {edges.map((e, i) => {
        const isActive =
          !!chainNodes && chainNodes.has(e.from) && chainNodes.has(e.to);
        const isDim = !!hoveredId && !isActive;
        const color = statusColors[e.dstStatus] || "#888";
        const x1 = e.src.right;
        const y1 = e.src.midY;
        const x2 = e.dst.left;
        const y2 = e.dst.midY;
        const dx = Math.max(Math.abs(x2 - x1) * 0.45, 60);
        const d = `M ${x1},${y1} C ${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;

        return (
          <g
            key={i}
            style={{ opacity: isDim ? 0.06 : isActive ? 1 : 0.55 }}
          >
            <path
              d={d}
              fill="none"
              stroke={color}
              strokeWidth={isActive ? 2.4 : 1.6}
              strokeLinecap="round"
              markerEnd={`url(#arr-${e.dstStatus})`}
            />
            {isActive && <circle cx={x1} cy={y1} r="3.5" fill={color} />}
          </g>
        );
      })}
    </svg>
  );
}
