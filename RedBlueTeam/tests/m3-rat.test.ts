import { describe, expect, it } from 'vitest';
import { allCopied, hasActiveCopies, isCopied, isCopying, startCopy, tickCopies } from '../src/scenarios/mission_03_ol_company/minigames/ratLogic';

describe('M3 //RAT: kopiowanie plików FREEVOLT', () => {
  it('start dodaje plik z 0% i nie restartuje kopiowanego', () => {
    const a = startCopy({}, 'x');
    expect(a).toEqual({ x: 0 });
    const b = tickCopies(a);
    expect(startCopy(b, 'x')).toBe(b);
  });

  it('tyknięcia dochodzą do 100% i nie przekraczają', () => {
    let p = startCopy({}, 'x');
    for (let i = 0; i < 20; i++) p = tickCopies(p);
    expect(p.x).toBe(100);
    expect(isCopied(p, 'x')).toBe(true);
    expect(isCopying(p, 'x')).toBe(false);
    expect(tickCopies(p)).toBe(p);
    expect(hasActiveCopies(p)).toBe(false);
  });

  it('allCopied wymaga wszystkich plików w całości', () => {
    const ids = ['a', 'b'];
    expect(allCopied({}, ids)).toBe(false);
    expect(allCopied({ a: 100, b: 40 }, ids)).toBe(false);
    expect(allCopied({ a: 100, b: 100 }, ids)).toBe(true);
    expect(allCopied({}, [])).toBe(false);
  });
});
