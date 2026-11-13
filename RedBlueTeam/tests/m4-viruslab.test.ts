import { describe, it, expect } from 'vitest';
import { createGrid, isMatrixComplete, revealStroke, revealedFraction } from '../src/engine/core/matrixLogic';
import { virusLabConfig } from '../src/scenarios/mission_04_energy_rock/stages';

describe('//BAZA_WIRUSÓW w configu M4', () => {
  const m = virusLabConfig.matrix;
  const opts = virusLabConfig.virus.options;

  it('D1 ma trzy opcje: ransomware ideal, RAT i keylogger suboptimal z odrzuceniem mentora (B2)', () => {
    expect(opts.map((o) => o.tier).sort()).toEqual(['ideal', 'suboptimal', 'suboptimal']);
    expect(virusLabConfig.virus.decisionNum).toBe(1);
    for (const id of ['rat', 'keylogger']) {
      const o = opts.find((x) => x.id === id)!;
      expect(o.tier).toBe('suboptimal');
      expect(o.reject?.mentorLine, id).toBeTruthy();
      expect(o.reject!.mentorLine).toMatch(/WYBIERZ INACZEJ/);
    }
    expect(opts.find((x) => x.id === 'ransomware')!.reject).toBeUndefined();
  });

  it('ransomware ma wariant z czterema częściami, nazwą i opisem grafiki; odrzucane opcje go nie potrzebują', () => {
    const v = m.variants.ransomware;
    expect(v).toBeDefined();
    expect(v.parts).toHaveLength(4);
    expect(v.programName.length).toBeGreaterThan(0);
    expect(v.imageAlt.length).toBeGreaterThan(0);
    expect(v.barColor).toBeTruthy();
    for (const o of opts.filter((x) => !x.reject)) expect(m.variants[o.id]).toBeDefined();
  });

  it('próg, segmenty i kolory z configu są ustawione', () => {
    expect(m.revealThreshold).toBeGreaterThan(0.5);
    expect(m.revealThreshold).toBeLessThanOrEqual(1);
    expect(m.segments).toBeGreaterThanOrEqual(4);
    expect(m.maskColor).toBeTruthy();
  });

  it('przejechanie po całym polu daje pełny postęp', () => {
    const g = createGrid();
    for (let y = 0.05; y <= 0.95; y += 0.1) revealStroke(g, { x: 0.05, y }, { x: 0.95, y }, 0.07);
    expect(isMatrixComplete(revealedFraction(g), m.revealThreshold)).toBe(true);
  });
});
