import { describe, it, expect } from 'vitest';
import {
  END_TOLERANCE_PX,
  INITIAL_READ_STATE,
  SITE_TABS,
  afterDecision,
  allTabsRead,
  canProceedToTarget,
  isScrolledToEnd,
  markTabRead,
  type ReadState
} from '../src/scenarios/mission_03_ol_company/minigames/osintLogic';
import { osintBrowserConfig } from '../src/scenarios/mission_03_ol_company/stages';

// Logika //TOR: PRZEGLĄDARKA (M3, porcja D): bramka „najpierw rekonesans, potem odpowiedź”.

describe('isScrolledToEnd', () => {
  const m = (scrollTop: number, clientHeight = 400, scrollHeight = 2000) => ({ scrollTop, clientHeight, scrollHeight });

  it('góra strony nie jest końcem', () => {
    expect(isScrolledToEnd(m(0))).toBe(false);
  });

  it('środek strony nie jest końcem', () => {
    expect(isScrolledToEnd(m(900))).toBe(false);
  });

  it('dokładny dół jest końcem', () => {
    expect(isScrolledToEnd(m(1600))).toBe(true);
  });

  it('ułamek piksela przed dołem i tolerancja liczą się jako koniec', () => {
    expect(isScrolledToEnd(m(1599.4))).toBe(true);
    expect(isScrolledToEnd(m(1600 - END_TOLERANCE_PX))).toBe(true);
  });

  it('więcej niż tolerancja przed dołem nie jest końcem', () => {
    expect(isScrolledToEnd(m(1600 - END_TOLERANCE_PX - 1))).toBe(false);
  });

  it('treść mieszcząca się w oknie jest od razu na końcu', () => {
    expect(isScrolledToEnd({ scrollTop: 0, clientHeight: 800, scrollHeight: 800 })).toBe(true);
    expect(isScrolledToEnd({ scrollTop: 0, clientHeight: 800, scrollHeight: 600 })).toBe(true);
  });

  it('ukryty lub niezmierzony obszar (wysokość 0) nigdy nie jest przeczytany', () => {
    expect(isScrolledToEnd({ scrollTop: 0, clientHeight: 0, scrollHeight: 0 })).toBe(false);
  });

  it('własna tolerancja', () => {
    expect(isScrolledToEnd(m(1550), 50)).toBe(true);
    expect(isScrolledToEnd(m(1549), 50)).toBe(false);
  });
});

describe('stan „przeczytano”', () => {
  it('zaczyna od niczego nie przeczytanego i nie wpuszcza dalej', () => {
    expect(INITIAL_READ_STATE).toEqual({ home: false, events: false });
    expect(allTabsRead(INITIAL_READ_STATE)).toBe(false);
    expect(canProceedToTarget(INITIAL_READ_STATE)).toBe(false);
  });

  it('obie zakładki w SITE_TABS', () => {
    expect([...SITE_TABS]).toEqual(['home', 'events']);
  });

  it('sama strona główna nie odblokowuje przejścia', () => {
    const s = markTabRead(INITIAL_READ_STATE, 'home', true);
    expect(s).toEqual({ home: true, events: false });
    expect(canProceedToTarget(s)).toBe(false);
  });

  it('same wydarzenia nie odblokowują przejścia', () => {
    const s = markTabRead(INITIAL_READ_STATE, 'events', true);
    expect(canProceedToTarget(s)).toBe(false);
  });

  it('obie zakładki, w dowolnej kolejności, odblokowują przejście', () => {
    const a = markTabRead(markTabRead(INITIAL_READ_STATE, 'home', true), 'events', true);
    const b = markTabRead(markTabRead(INITIAL_READ_STATE, 'events', true), 'home', true);
    expect(canProceedToTarget(a)).toBe(true);
    expect(canProceedToTarget(b)).toBe(true);
  });

  it('pomiar „nie na końcu” niczego nie zmienia i zwraca ten sam obiekt', () => {
    const s: ReadState = { home: true, events: false };
    expect(markTabRead(s, 'events', false)).toBe(s);
  });

  it('przeczytanej zakładki nie da się odznaczyć (powrót w górę strony)', () => {
    const s: ReadState = { home: true, events: true };
    expect(markTabRead(s, 'home', false)).toBe(s);
    expect(canProceedToTarget(s)).toBe(true);
  });

  it('nie zmienia stanu wejściowego', () => {
    const before = { ...INITIAL_READ_STATE };
    markTabRead(INITIAL_READ_STATE, 'home', true);
    expect(INITIAL_READ_STATE).toEqual(before);
  });
});

describe('afterDecision', () => {
  it('critical zatrzymuje minigrę (ekran wykrycia po stronie silnika)', () => {
    expect(afterDecision('critical')).toBe('stop');
  });

  it('ideal i suboptimal prowadzą dalej', () => {
    expect(afterDecision('ideal')).toBe('continue');
    expect(afterDecision('suboptimal')).toBe('continue');
  });
});

describe('dane //TOR zgodne z założeniami minigry', () => {
  const { site, target } = osintBrowserConfig;

  it('każdy pracownik ma kartę celu D2 i odwrotnie', () => {
    const optionIds = target.options.map((o) => o.id).sort();
    expect(site.employees.map((e) => e.optionId).sort()).toEqual(optionIds);
  });

  it('karty celu pokazują same imiona i nazwiska (bez opisu)', () => {
    for (const o of target.options) {
      expect(o.desc).toBeUndefined();
      expect(site.employees.some((e) => e.name === o.label)).toBe(true);
    }
  });

  it('opisy pracowników nie mówią o szkoleniach ani poziomie wiedzy o bezpieczeństwie', () => {
    for (const e of site.employees) {
      expect(`${e.bio} ${e.tenure}`.toLowerCase()).not.toMatch(/szkole|przeszkol|świadomo|podatn/);
    }
  });

  it('wydarzenia mają zdjęcia, a strona dwie zakładki do przeczytania', () => {
    expect(site.events.length).toBeGreaterThan(0);
    for (const ev of site.events) expect(ev.photos.length).toBeGreaterThan(0);
    expect(SITE_TABS).toHaveLength(2);
  });
});
