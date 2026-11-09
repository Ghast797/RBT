import { describe, it, expect } from 'vitest';
import { createGrid, isMatrixComplete, revealStroke, revealedFraction } from '../src/engine/core/matrixLogic';
import { virusLabConfig } from '../src/scenarios/mission_03_ol_company/stages';

// Logika zdrapki jest w silniku (tests/matrixLogic.test.ts); tu tylko dane M3.
describe('zdrapka w configu M3', () => {
  const m = virusLabConfig.matrix;

  it('próg i segmenty są sensowne', () => {
    expect(m.revealThreshold).toBeGreaterThan(0.5);
    expect(m.revealThreshold).toBeLessThanOrEqual(1);
    expect(m.segments).toBeGreaterThanOrEqual(4);
  });

  it('każda opcja D1 prowadząca do zdrapki (nie critical) ma wariant: nazwa, grafika z alt i cztery podpisy', () => {
    const reachable = virusLabConfig.virus.options.filter((o) => o.tier !== 'critical');
    expect(reachable.length).toBeGreaterThanOrEqual(2);
    for (const o of reachable) {
      const v = m.variants[o.id];
      expect(v, `wariant ${o.id}`).toBeDefined();
      expect(v.parts).toHaveLength(4);
      expect(v.programName.length).toBeGreaterThan(0);
      expect(v.imageAlt.length).toBeGreaterThan(0);
    }
    expect(m.variants.rat.image).toEqual({ group: 'virus', name: 'rat' });
  });

  it('ransomware nie dostaje grafiki ani podpisów RAT-a', () => {
    const rat = m.variants.rat;
    const ransom = m.variants.ransomware;
    expect(ransom.image).not.toEqual(rat.image);
    expect(ransom.programName).toBe('RANSOMWARE');
    expect(ransom.parts.map((p) => p.id)).not.toEqual(rat.parts.map((p) => p.id));
    const text = JSON.stringify(ransom).toUpperCase();
    expect(text).not.toMatch(/PODGLĄD EKRANU|STEROWANIE|RAT/);
  });

  it('żargon „matryca kompilacji” nie trafia do widocznych tekstów', () => {
    const visible = [m.heading, m.programPrefix, m.loaderText, m.doneMessage, m.task, m.hint].join(' ').toLowerCase();
    expect(visible).not.toMatch(/matryc/);
  });

  it('przejechanie po całym polu pędzlem daje pełny postęp przy progu z configu', () => {
    const g = createGrid();
    for (let y = 0.05; y <= 0.95; y += 0.1) revealStroke(g, { x: 0.05, y }, { x: 0.95, y }, 0.07);
    expect(isMatrixComplete(revealedFraction(g), m.revealThreshold)).toBe(true);
  });
});
