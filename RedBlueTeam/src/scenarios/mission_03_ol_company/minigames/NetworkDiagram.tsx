// Animowany schemat sieci (RatSessionApp, ekran 4): haker -> węzeł pośredni -> zainfekowane stacje robocze.
// Węzły i napisy z configu; geometria wynika z liczby stacji (kind: hacker, relay, infected).

import React from 'react';
import type { NetworkNode } from './types';

const W = 800;
const H = 300;

export const NetworkDiagram: React.FC<{ accent: string; nodes: NetworkNode[] }> = ({ accent, nodes }) => {
  const hacker = nodes.find((n) => n.kind === 'hacker');
  const relay = nodes.find((n) => n.kind === 'relay');
  const infected = nodes.filter((n) => n.kind === 'infected');
  const pos: Record<string, { x: number; y: number }> = {};
  if (hacker) pos[hacker.id] = { x: 90, y: H / 2 };
  if (relay) pos[relay.id] = { x: 340, y: H / 2 };
  infected.forEach((n, i) => {
    const slots = infected.length;
    pos[n.id] = { x: 650, y: slots === 1 ? H / 2 : 50 + (i * (H - 100)) / (slots - 1) };
  });

  const links: { from: string; to: string; delay: number }[] = [];
  if (hacker && relay) links.push({ from: hacker.id, to: relay.id, delay: 0.2 });
  if (relay) infected.forEach((n, i) => links.push({ from: relay.id, to: n.id, delay: 0.9 + i * 0.35 }));

  const nodeDelay = (n: NetworkNode) =>
    n.kind === 'hacker' ? 0 : n.kind === 'relay' ? 0.5 : 1.1 + infected.indexOf(n) * 0.35;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-full"
      role="img"
      aria-label="Schemat sieci"
      preserveAspectRatio="xMidYMid meet"
    >
      <style>{`
        @keyframes rat-flow { to { stroke-dashoffset: -28; } }
        @keyframes rat-pop { from { opacity: 0; } to { opacity: 1; } }
        .rat-link { stroke-dasharray: 8 6; animation: rat-flow 0.9s linear infinite, rat-pop 0.5s ease-out both; }
        .rat-node { animation: rat-pop 0.5s ease-out both; }
        @media (prefers-reduced-motion: reduce) { .rat-link { animation: none; } .rat-node { animation: none; } }
      `}</style>
      {links.map((l) => (
        <line
          key={`${l.from}-${l.to}`}
          className="rat-link"
          x1={pos[l.from].x}
          y1={pos[l.from].y}
          x2={pos[l.to].x}
          y2={pos[l.to].y}
          stroke={accent}
          strokeWidth={2.5}
          style={{ animationDelay: `0s, ${l.delay}s` }}
        />
      ))}
      {nodes.map((n) => {
        const p = pos[n.id];
        if (!p) return null;
        const color = n.kind === 'infected' ? '#f87171' : n.kind === 'relay' ? '#facc15' : accent;
        const r = n.kind === 'infected' ? 24 : 30;
        return (
          <g key={n.id} className="rat-node" style={{ animationDelay: `${nodeDelay(n)}s` }}>
            <circle cx={p.x} cy={p.y} r={r + 8} fill={color} opacity={0.12} />
            <circle cx={p.x} cy={p.y} r={r} fill="#07131a" stroke={color} strokeWidth={2.5} />
            {n.kind === 'infected' ? (
              <path
                d={`M${p.x - 10} ${p.y - 7}h20v12h-20z M${p.x - 5} ${p.y + 8}h10`}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
              />
            ) : n.kind === 'relay' ? (
              <path d={`M${p.x - 12} ${p.y}h24 M${p.x} ${p.y - 12}v24`} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
            ) : (
              <path
                d={`M${p.x - 12} ${p.y + 8}l8-16l8 8l8-8l0 16z`}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinejoin="round"
              />
            )}
            <text
              x={p.x}
              y={p.y + r + 20}
              textAnchor="middle"
              fontSize={14}
              fontWeight={800}
              fontFamily="monospace"
              fill={color}
            >
              {n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
