import { describe, it, expect } from 'vitest';
import { droneConfig } from '../src/scenarios/mission_03_ol_company/stages';
import {
  CAR_DIMS,
  CAR_HIT_MARGIN,
  DRONE_ORIGIN,
  PARKING_SCENE,
  carAt,
  carRoofCenter,
  clientToScene,
  droneStatusFor,
  flightPosition,
  flightProgress,
  formatClock,
  parkingSlots,
  placeCars,
  resolveDropOptionId
} from '../src/scenarios/mission_03_ol_company/minigames/droneLogic';
import { shuffled } from '../src/engine/core/shuffle';

// Logika //DRON (porcja F): mapowanie kliknięcia na opcję D6, geometria parkingu, lot i statusy.

const { parkingCars, asphalt } = droneConfig;
const placed = placeCars(parkingCars);

describe('parking: układ miejsc', () => {
  it('ma 8 aut w 2 rzędach po 4, wszystkie w obrębie sceny', () => {
    expect(parkingCars).toHaveLength(8);
    const slots = parkingSlots(8);
    expect(slots).toHaveLength(8);
    expect(new Set(slots.map((s) => s.y)).size).toBe(2);
    for (const s of slots) {
      expect(s.x).toBeGreaterThanOrEqual(0);
      expect(s.x + s.w).toBeLessThanOrEqual(PARKING_SCENE.width);
      expect(s.y + s.h).toBeLessThanOrEqual(PARKING_SCENE.height);
    }
  });

  it('miejsca się nie nakładają, a auta mieszczą się w swoich miejscach', () => {
    const slots = parkingSlots(8);
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const a = slots[i];
        const b = slots[j];
        const overlap = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
        expect(overlap).toBe(false);
      }
    }
    for (const p of placed) {
      expect(p.rect.x).toBeGreaterThanOrEqual(p.slot.x);
      expect(p.rect.y).toBeGreaterThanOrEqual(p.slot.y);
      expect(p.rect.x + p.rect.w).toBeLessThanOrEqual(p.slot.x + p.slot.w);
      expect(p.rect.y + p.rect.h).toBeLessThanOrEqual(p.slot.y + p.slot.h);
    }
  });

  it('między rzędami jest pas jezdni szerszy niż margines trafienia auta', () => {
    const slots = parkingSlots(8);
    const laneStart = slots[0].y + slots[0].h;
    const laneEnd = slots[4].y;
    expect(laneEnd - laneStart).toBeGreaterThan(2 * CAR_HIT_MARGIN + 20);
  });
});

describe('dopasowanie kliknięcia do opcji D6', () => {
  const optionIds = new Set(droneConfig.car.options.map((o) => o.id));

  it('środek dachu każdego auta daje opcję tego auta (przy dowolnym losowym rozmieszczeniu)', () => {
    for (let n = 0; n < 25; n++) {
      const layout = placeCars(shuffled(parkingCars));
      for (const p of layout) {
        expect(resolveDropOptionId(carRoofCenter(p.rect, p.car.shape), layout, asphalt.id)).toBe(p.car.id);
      }
    }
  });

  it('klik w asfalt (jezdnia, szczeliny, margines, poza sceną) daje opcję asphalt', () => {
    const slots = parkingSlots(8);
    const lane = { x: PARKING_SCENE.width / 2, y: (slots[0].y + slots[0].h + slots[4].y) / 2 };
    expect(resolveDropOptionId(lane, placed, asphalt.id)).toBe(asphalt.id);
    const gap = { x: slots[0].x + slots[0].w + 1, y: slots[0].y + slots[0].h / 2 };
    expect(carAt(gap, placed)).toBeNull();
    const beside = { x: placed[0].rect.x - CAR_HIT_MARGIN - 6, y: placed[0].rect.y + placed[0].rect.h / 2 };
    expect(resolveDropOptionId(beside, placed, asphalt.id)).toBe(asphalt.id);
    expect(resolveDropOptionId({ x: -50, y: -50 }, placed, asphalt.id)).toBe(asphalt.id);
    expect(resolveDropOptionId({ x: 9999, y: 9999 }, placed, asphalt.id)).toBe(asphalt.id);
  });

  it('każdy wynik dopasowania ma opcję w config.car.options', () => {
    for (let x = 0; x <= PARKING_SCENE.width; x += 37) {
      for (let y = 0; y <= PARKING_SCENE.height; y += 29) {
        expect(optionIds.has(resolveDropOptionId({ x, y }, placed, asphalt.id))).toBe(true);
      }
    }
  });

  it('tolerancja trafienia obejmuje tuż-obok karoserii, ale nie dalej', () => {
    const p = placed[2];
    const cy = p.rect.y + p.rect.h / 2;
    expect(carAt({ x: p.rect.x - CAR_HIT_MARGIN + 1, y: cy }, placed)).toBe(p.car.id);
    expect(carAt({ x: p.rect.x - CAR_HIT_MARGIN - 1, y: cy }, placed)).toBeNull();
  });

  it('pusty parking: zawsze asfalt', () => {
    expect(resolveDropOptionId({ x: 400, y: 230 }, [], asphalt.id)).toBe(asphalt.id);
  });
});

describe('dane parkingu (źródło: stages.ts)', () => {
  it('dokładnie jedno auto ideal (dwukolorowe), a asfalt jest critical', () => {
    const ideal = parkingCars.filter((c) => c.tier === 'ideal');
    expect(ideal).toHaveLength(1);
    expect(ideal[0].body).not.toBe(ideal[0].roof);
    expect(asphalt.tier).toBe('critical');
    expect(droneConfig.car.options.find((o) => o.id === asphalt.id)?.tier).toBe('critical');
  });

  it('są auta łudząco podobne do auta ofiary (wspólny kolor nadwozia lub dachu)', () => {
    const target = parkingCars.find((c) => c.tier === 'ideal')!;
    const similar = parkingCars.filter(
      (c) =>
        c.id !== target.id &&
        (c.body === target.body || c.roof === target.roof || c.body === target.roof || c.roof === target.body)
    );
    expect(similar.length).toBeGreaterThanOrEqual(2);
  });

  it('każdy kształt ma wymiary i mieści się w miejscu', () => {
    for (const car of parkingCars) {
      const d = CAR_DIMS[car.shape];
      expect(d.w).toBeLessThan(180);
      expect(d.h).toBeLessThan(150);
      expect(d.cabinStart + d.cabinLen).toBeLessThan(1);
    }
  });
});

describe('współrzędne i lot', () => {
  it('clientToScene uwzględnia puste pasy przy skalowaniu meet', () => {
    // kontener 1600x390, scena 800x390 w skali 1:1, wyśrodkowana (pas 400 px z lewej)
    const box = { left: 100, top: 50, width: 1600, height: 390 };
    const p = clientToScene({ x: 100 + 400 + 10, y: 50 + 20 }, box);
    expect(p.x).toBeCloseTo(10);
    expect(p.y).toBeCloseTo(20);
  });

  it('flightPosition interpoluje i przycina postęp', () => {
    const to = { x: 60, y: 10 };
    expect(flightPosition(DRONE_ORIGIN, to, 0)).toEqual(DRONE_ORIGIN);
    expect(flightPosition(DRONE_ORIGIN, to, 100)).toEqual(to);
    expect(flightPosition({ x: 0, y: 0 }, { x: 100, y: 50 }, 50)).toEqual({ x: 50, y: 25 });
    expect(flightPosition({ x: 0, y: 0 }, { x: 100, y: 50 }, 250)).toEqual({ x: 100, y: 50 });
    expect(flightPosition({ x: 0, y: 0 }, { x: 100, y: 50 }, -5)).toEqual({ x: 0, y: 0 });
  });

  it('flightProgress rośnie i kończy się na 100', () => {
    expect(flightProgress(0, 2000)).toBe(0);
    expect(flightProgress(1000, 2000)).toBe(50);
    expect(flightProgress(9999, 2000)).toBe(100);
  });

  it('formatClock zwraca MM:SS', () => {
    expect(formatClock(0)).toBe('00:00');
    expect(formatClock(75)).toBe('01:15');
    expect(formatClock(-3)).toBe('00:00');
  });
});

describe('statusy drona', () => {
  const { statuses } = droneConfig;
  it('kolejne ekrany pokazują statusy z dokumentu', () => {
    expect(droneStatusFor('activate', false, statuses)).toBe('STOI W POKOJU HAKERA');
    expect(droneStatusFor('payload', false, statuses)).toBe('STOI W POKOJU HAKERA');
    expect(droneStatusFor('payload', true, statuses)).toBe('CZEKA NA ŁADUNEK');
    expect(droneStatusFor('map', true, statuses)).toBe('CZEKA NA WSPÓŁRZĘDNE');
    expect(droneStatusFor('flying', true, statuses)).toBe('LECI Z WYSOKĄ PRĘDKOŚCIĄ');
  });
  it('przy kamerze brak statusu (dokument go nie podaje)', () => {
    expect(droneStatusFor('camera', true, statuses)).toBeNull();
    expect(droneStatusFor('done', true, statuses)).toBeNull();
  });
});

describe('D5: mapa', () => {
  it('4 punkty, jedna opcja na punkt, ideal = Ołtaszyńska 92C', () => {
    expect(droneConfig.mapLocations).toHaveLength(4);
    for (const loc of droneConfig.mapLocations) {
      const opt = droneConfig.address.options.find((o) => o.id === loc.id);
      expect(opt?.tier).toBe(loc.tier);
      expect(loc.x).toBeGreaterThan(0);
      expect(loc.x).toBeLessThan(100);
    }
    const ideal = droneConfig.mapLocations.find((l) => l.tier === 'ideal');
    expect(ideal?.address).toBe('OŁTASZYŃSKA 92C');
  });
});
