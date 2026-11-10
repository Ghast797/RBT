import { describe, it, expect } from 'vitest';
import { createGrid, isMatrixComplete, revealStroke, revealedFraction } from '../src/engine/core/matrixLogic';
import { virusLabConfig } from '../src/scenarios/mission_04_energy_rock/stages';

describe('//BAZA_WIRUSÓW w configu M4', () => {
  const m = virusLabConfig.matrix;
  const opts = virusLabConfig.virus.options;

  it('D1 ma trzy opcje o poziomach ideal, suboptimal i critical', () => {
    expect(opts.map((o) => o.tier).sort()).toEqual(['critical', 'ideal', 'suboptimal']);
    expect(virusLabConfig.virus.decisionNum).toBe(1);
  });

  it('ransomware i RAT mają wariant z czterema częściami, nazwą i opisem grafiki', () => {
    for (const id of ['ransomware', 'rat']) {
      const v = m.variants[id];
      expect(v, `wariant ${id}`).toBeDefined();
      expect(v.parts).toHaveLength(4);
      expect(v.programName.length).toBeGreaterThan(0);
      expect(v.imageAlt.length).toBeGreaterThan(0);
      expect(v.barColor).toBeTruthy();
    }
  });

  it('keylogger (critical) nie ma wariantu zdrapki, a każda opcja poza critical ma', () => {
    expect(m.variants.keylogger).toBeUndefined();
    for (const o of opts.filter((x) => x.tier !== 'critical')) expect(m.variants[o.id]).toBeDefined();
    expect(opts.find((o) => o.id === 'keylogger')?.tier).toBe('critical');
  });

  it('warianty różnią się grafiką i częściami', () => {
    expect(m.variants.ransomware.image).not.toEqual(m.variants.rat.image);
    expect(m.variants.ransomware.parts.map((p) => p.id)).not.toEqual(m.variants.rat.parts.map((p) => p.id));
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
