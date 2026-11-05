import { describe, it, expect } from 'vitest';
import { shuffled } from '../src/engine/core/shuffle';

describe('shuffled (losowa kolejność opcji)', () => {
  it('zwraca te same elementy i nie zmienia wejścia', () => {
    const input = ['a', 'b', 'c', 'd'];
    const out = shuffled(input);
    expect(input).toEqual(['a', 'b', 'c', 'd']);
    expect([...out].sort()).toEqual(['a', 'b', 'c', 'd']);
  });

  it('przy różnych losowaniach daje różne kolejności (ideal nie stoi stale na 1. miejscu)', () => {
    const firsts = new Set<string>();
    for (let i = 0; i < 200; i++) firsts.add(shuffled(['ideal', 'sub', 'crit'])[0]);
    expect(firsts.size).toBe(3);
  });

  it('jest deterministyczne dla podanego generatora', () => {
    const seq = [0.1, 0.9, 0.5];
    let k = 0;
    const rnd = () => seq[k++ % seq.length];
    expect(shuffled([1, 2, 3, 4], rnd)).toEqual(shuffled([1, 2, 3, 4], (() => { let j = 0; return () => seq[j++ % seq.length]; })()));
  });
});
