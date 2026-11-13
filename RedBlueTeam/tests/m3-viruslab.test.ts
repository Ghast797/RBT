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
    const reachable = virusLabConfig.virus.options.filter((o) => o.tier !== 'critical' && !o.reject);
    expect(reachable.map((o) => o.id)).toEqual(['rat']);
    for (const o of reachable) {
      const v = m.variants[o.id];
      expect(v, `wariant ${o.id}`).toBeDefined();
      expect(v.parts).toHaveLength(4);
      expect(v.programName.length).toBeGreaterThan(0);
      expect(v.imageAlt.length).toBeGreaterThan(0);
    }
    expect(m.variants.rat.image).toEqual({ group: 'virus', name: 'rat' });
  });

  it('wariantów zdrapki nie ma dla opcji, które nie dochodzą do zdrapki (ransomware critical, keylogger B2)', () => {
    expect(Object.keys(m.variants)).toEqual(['rat']);
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
