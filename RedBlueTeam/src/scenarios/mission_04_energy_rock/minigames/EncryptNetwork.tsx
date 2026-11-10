// Ekran „szyfrowanie sieci” (RansomC2App, ekran 2): diagram SVG 8 węzłów; klik w zielony węzeł szyfruje go
// (fioletowy + kłódka). Linie biegną od węzła `vector` do pozostałych. Stan zaszyfrowanych węzłów trzyma rodzic.

import React from 'react';
import type { NetworkNode } from './types';

const W = 800;
const H = 420;
const GREEN = '#22c55e';
export const ENCRYPTED_COLOR = '#8A2BE2';

const px = (n: NetworkNode) => (n.x / 100) * W;
const py = (n: NetworkNode) => (n.y / 100) * H;

export const EncryptNetwork: React.FC<{
  nodes: NetworkNode[];
  encrypted: ReadonlySet<string>;
  onEncrypt: (id: string) => void;
}> = ({ nodes, encrypted, onEncrypt }) => {
  const vector = nodes.find((n) => n.kind === 'vector');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" role="group" aria-label="Schemat sieci firmy" preserveAspectRatio="xMidYMid meet">
      {vector &&
        nodes
          .filter((n) => n.id !== vector.id)
          .map((n) => (
            <line
              key={n.id}
              x1={px(vector)}
              y1={py(vector)}
              x2={px(n)}
              y2={py(n)}
              stroke={encrypted.has(n.id) ? ENCRYPTED_COLOR : '#334155'}
              strokeWidth={2.5}
              strokeDasharray="8 6"
            />
          ))}
      {nodes.map((n) => {
        const done = encrypted.has(n.id) || n.kind === 'vector';
        const isVector = n.kind === 'vector';
        const color = done ? ENCRYPTED_COLOR : GREEN;
        const x = px(n);
        const y = py(n);
        const r = n.kind === 'main' || isVector ? 30 : 26;
        const clickable = !done;
        return (
          <g
            key={n.id}
            role="button"
            tabIndex={clickable ? 0 : -1}
            aria-label={`${n.label}${done ? ' (zaszyfrowany)' : ''}`}
            aria-disabled={!clickable}
            onClick={() => clickable && onEncrypt(n.id)}
            onKeyDown={(e) => {
              if (clickable && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onEncrypt(n.id);
              }
            }}
            style={{ cursor: clickable ? 'pointer' : 'default', outline: 'none' }}
          >
            <circle cx={x} cy={y} r={r + 10} fill={color} opacity={done ? 0.2 : 0.12} />
            <circle cx={x} cy={y} r={r} fill="#07131a" stroke={color} strokeWidth={3} />
            {encrypted.has(n.id) ? (
              <g stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect x={x - 10} y={y - 2} width={20} height={15} rx={2} fill={color} fillOpacity={0.35} />
                <path d={`M${x - 6} ${y - 2}v-5a6 6 0 0 1 12 0v5`} />
              </g>
            ) : (
              <path
                d={`M${x - 11} ${y - 8}h22v14h-22z M${x - 6} ${y + 10}h12`}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
              />
            )}
            <text x={x} y={y + r + 20} textAnchor="middle" fontSize={15} fontWeight={800} fontFamily="monospace" fill={color}>
              {n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
