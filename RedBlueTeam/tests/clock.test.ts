import { describe, it, expect } from 'vitest';
import {
  parseClock,
  formatClock,
  forwardSpanMinutes,
  clockAt,
  easeInOut,
  hoursElapsed,
  handAngles,
  resolveJumpClock
} from '../src/engine/core/clock';

describe('parseClock / formatClock', () => {
  it('parsuje HH:MM i H:MM na minuty od północy', () => {
    expect(parseClock('00:00')).toBe(0);
    expect(parseClock('06:02')).toBe(362);
    expect(parseClock('6:02')).toBe(362);
    expect(parseClock('23:59')).toBe(1439);
  });

  it('zły format lub zakres to null', () => {
    for (const bad of ['', '24:00', '12:60', '1202', 'ab:cd', '12:5', undefined, null]) {
      expect(parseClock(bad as any)).toBeNull();
    }
  });

  it('formatuje minuty (także ułamkowe i spoza doby) jako HH:MM', () => {
    expect(formatClock(362)).toBe('06:02');
    expect(formatClock(362.9)).toBe('06:02');
    expect(formatClock(1440 + 5)).toBe('00:05');
    expect(formatClock(-10)).toBe('23:50');
  });
});

describe('forwardSpanMinutes', () => {
  it('liczy w przód, także przez północ', () => {
    expect(forwardSpanMinutes(parseClock('22:15')!, parseClock('06:02')!)).toBe(7 * 60 + 47);
    expect(forwardSpanMinutes(parseClock('06:02')!, parseClock('08:12')!)).toBe(130);
  });

  it('ta sama godzina = 0', () => {
    expect(forwardSpanMinutes(100, 100)).toBe(0);
  });
});

describe('easeInOut i clockAt', () => {
  it('ease-in-out: 0, 0.5 i 1 w punktach stałych, powoli na początku i końcu', () => {
    expect(easeInOut(0)).toBe(0);
    expect(easeInOut(0.5)).toBeCloseTo(0.5);
    expect(easeInOut(1)).toBe(1);
    expect(easeInOut(0.1)).toBeLessThan(0.1);
    expect(easeInOut(0.9)).toBeGreaterThan(0.9);
    expect(easeInOut(-1)).toBe(0);
    expect(easeInOut(2)).toBe(1);
  });

  it('clockAt zaczyna od godziny startowej i kończy dokładnie na docelowej', () => {
    const from = parseClock('22:15')!;
    const to = parseClock('06:02')!;
    expect(clockAt(from, to, 0)).toBe(from);
    expect(clockAt(from, to, 1)).toBe(to);
  });

  it('w połowie przeskoku 22:15 → 06:02 jest po północy (3:08 + 22:15 → ok. 02:08)', () => {
    const mid = clockAt(parseClock('22:15')!, parseClock('06:02')!, 0.5);
    expect(formatClock(mid)).toBe('02:08');
  });

  it('czas rośnie monotonicznie (zawijając się przez północ)', () => {
    const from = parseClock('22:15')!;
    const to = parseClock('06:02')!;
    let travelled = 0;
    let prev = from;
    for (let i = 1; i <= 100; i++) {
      const cur = clockAt(from, to, i / 100);
      travelled += (((cur - prev) % 1440) + 1440) % 1440;
      prev = cur;
    }
    expect(travelled).toBeCloseTo(forwardSpanMinutes(from, to), 5);
  });

  it('przy zerowym odcinku zegar stoi', () => {
    expect(clockAt(100, 100, 0.5)).toBe(100);
  });
});

describe('hoursElapsed', () => {
  it('zlicza przekroczone granice pełnych godzin', () => {
    const from = parseClock('22:15')!;
    const to = parseClock('06:02')!;
    expect(hoursElapsed(from, to, 0)).toBe(0);
    // 22:15 → 06:02: granice 23, 0, 1, 2, 3, 4, 5, 6 = 8
    expect(hoursElapsed(from, to, 1)).toBe(8);
  });
});

describe('handAngles', () => {
  it('kąty wskazówek: 3:00 i 6:30', () => {
    expect(handAngles(180)).toEqual({ hour: 90, minute: 0 });
    expect(handAngles(6 * 60 + 30)).toEqual({ hour: 195, minute: 180 });
    // 18:00 wygląda jak 6:00
    expect(handAngles(18 * 60).hour).toBe(180);
  });
});

describe('resolveJumpClock', () => {
  it('oba czasy poprawne', () => {
    expect(resolveJumpClock('22:15', '06:02')).toEqual({ from: 22 * 60 + 15, to: 362 });
  });

  it('brak clockFrom (lub zły format) → start 3 h przed celem, z zawinięciem przez północ', () => {
    expect(resolveJumpClock(undefined, '08:12')).toEqual({ from: 5 * 60 + 12, to: 8 * 60 + 12 });
    expect(resolveJumpClock('zle', '01:00')).toEqual({ from: 22 * 60, to: 60 });
  });

  it('brak lub zły clockTo → null (wariant bez cyfr)', () => {
    expect(resolveJumpClock('22:15', undefined)).toBeNull();
    expect(resolveJumpClock('22:15', '25:00')).toBeNull();
  });
});
