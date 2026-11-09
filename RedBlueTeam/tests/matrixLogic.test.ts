import { describe, it, expect } from 'vitest';
import {
  GRID_COLS,
  GRID_ROWS,
  createGrid,
  isMatrixComplete,
  litParts,
  litSegments,
  matrixProgress,
  matrixView,
  revealDisc,
  revealStroke,
  revealedCount,
  revealedFraction
} from '../src/engine/core/matrixLogic';

describe('matrixLogic: odsłanianie', () => {
  it('pusta siatka: 0 odsłoniętych', () => {
    const g = createGrid();
    expect(g.cells.length).toBe(GRID_COLS * GRID_ROWS);
    expect(revealedFraction(g)).toBe(0);
  });

  it('koło odsłania komórki wokół punktu i nie liczy ich dwa razy', () => {
    const g = createGrid();
    const first = revealDisc(g, { x: 0.5, y: 0.5 }, 0.1);
    expect(first).toBeGreaterThan(0);
    expect(revealedCount(g)).toBe(first);
    expect(revealDisc(g, { x: 0.5, y: 0.5 }, 0.1)).toBe(0);
    // Koło o promieniu 0,1 szerokości ≈ π·(6,4 kom.)² ≈ 129 komórek.
    expect(first).toBeGreaterThan(110);
    expect(first).toBeLessThan(150);
  });

  it('koło na brzegu pola nie wychodzi poza siatkę', () => {
    const g = createGrid();
    expect(revealDisc(g, { x: 0, y: 0 }, 0.1)).toBeGreaterThan(0);
    expect(revealDisc(g, { x: 1, y: 1 }, 0.1)).toBeGreaterThan(0);
    expect(revealDisc(g, { x: 3, y: 3 }, 0.1)).toBe(0);
  });

  it('pociągnięcie nie zostawia dziur nawet przy dużym skoku kursora', () => {
    const g = createGrid();
    revealStroke(g, { x: 0.1, y: 0.5 }, { x: 0.9, y: 0.5 }, 0.07);
    // Wszystkie komórki środkowego rzędu między końcami są odsłonięte.
    const row = Math.floor(0.5 * GRID_ROWS);
    for (let x = Math.ceil(0.1 * GRID_COLS); x <= Math.floor(0.9 * GRID_COLS) - 1; x++) {
      expect(g.cells[row * GRID_COLS + x]).toBe(1);
    }
  });

  it('klik (odcinek o zerowej długości) też odsłania', () => {
    const g = createGrid();
    expect(revealStroke(g, { x: 0.3, y: 0.3 }, { x: 0.3, y: 0.3 }, 0.07)).toBeGreaterThan(0);
  });

  it('odsłonięcie całego pola daje ułamek 1', () => {
    const g = createGrid();
    for (let y = 0; y <= 1; y += 0.1) revealStroke(g, { x: 0, y }, { x: 1, y }, 0.08);
    expect(revealedFraction(g)).toBe(1);
  });
});

describe('matrixLogic: postęp, segmenty i podpisy', () => {
  it('postęp liczy się względem progu odsłonięcia i jest obcięty do 0..1', () => {
    expect(matrixProgress(0, 0.92)).toBe(0);
    expect(matrixProgress(0.46, 0.92)).toBeCloseTo(0.5);
    expect(matrixProgress(0.92, 0.92)).toBe(1);
    expect(matrixProgress(1, 0.92)).toBe(1);
    expect(matrixProgress(-1, 0.92)).toBe(0);
  });

  it('zakończenie dopiero przy progu (nie przy 91%)', () => {
    expect(isMatrixComplete(0.91, 0.92)).toBe(false);
    expect(isMatrixComplete(0.92, 0.92)).toBe(true);
    expect(isMatrixComplete(1, 0.92)).toBe(true);
  });

  it('segmenty zapalają się po kolei, wszystkie dopiero przy 100%', () => {
    expect(litSegments(0, 10)).toBe(0);
    expect(litSegments(0.09, 10)).toBe(0);
    expect(litSegments(0.1, 10)).toBe(1);
    expect(litSegments(0.3, 10)).toBe(3);
    expect(litSegments(0.99, 10)).toBe(9);
    expect(litSegments(1, 10)).toBe(10);
  });

  it('cztery podpisy zapalają się co 25%, ostatni przy 100%', () => {
    expect(litParts(0, 4)).toBe(0);
    expect(litParts(0.24, 4)).toBe(0);
    expect(litParts(0.25, 4)).toBe(1);
    expect(litParts(0.5, 4)).toBe(2);
    expect(litParts(0.99, 4)).toBe(3);
    expect(litParts(1, 4)).toBe(4);
  });
});

describe('matrixView: pasek, podpisy i „gotowe” z jednego źródła', () => {
  const T = 0.92;

  it('gotowe dokładnie wtedy, gdy zapalone są wszystkie segmenty i wszystkie 4 podpisy', () => {
    for (let f = 0; f <= 1.0001; f += 0.001) {
      const v = matrixView(Math.min(1, f), T, 10, 4);
      if (v.complete) {
        expect(v.partsLit, `f=${f}`).toBe(4);
        expect(v.segmentsLit, `f=${f}`).toBe(10);
        expect(v.percent).toBe(100);
      } else {
        expect(v.partsLit, `f=${f}`).toBeLessThan(4);
        expect(v.segmentsLit, `f=${f}`).toBeLessThan(10);
        expect(v.percent, `f=${f}`).toBeLessThan(100);
      }
    }
  });

  it('próg: przy 92% pola zdrapka jest domknięta z czterema podpisami, tuż poniżej jeszcze nie', () => {
    const at = matrixView(0.92, T, 10, 4);
    expect(at.complete).toBe(true);
    expect(at.partsLit).toBe(4);
    const below = matrixView(0.919, T, 10, 4);
    expect(below.complete).toBe(false);
    expect(below.partsLit).toBe(3);
  });
});
