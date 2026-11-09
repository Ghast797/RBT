import { describe, it, expect } from 'vitest';
import {
  DEFAULT_DRAG_THRESHOLD,
  moveDrag,
  pickDropZone,
  pressDrag,
  releaseDrag,
  type DropZoneRect
} from '../src/engine/core/pointerDrag';

const rect = (left: number, top: number, right: number, bottom: number) => ({ left, top, right, bottom });

// Lewy ekran (0–700) i prawy monitor (720–1000), tak jak w pulpicie z portalem.
const zones: DropZoneRect[] = [
  { id: 'usb', rect: rect(100, 100, 300, 300) },
  { id: 'desktop_hacker', rect: rect(750, 50, 950, 250) },
  { id: 'hidden_app', rect: rect(0, 0, 0, 0) }
];

describe('pickDropZone', () => {
  it('trafia w strefę na lewym ekranie i na prawym monitorze (jedna przestrzeń współrzędnych okna)', () => {
    expect(pickDropZone(zones, 150, 150)).toBe('usb');
    expect(pickDropZone(zones, 800, 100)).toBe('desktop_hacker');
  });

  it('poza strefami i na krawędzi: null / trafienie', () => {
    expect(pickDropZone(zones, 500, 500)).toBeNull();
    expect(pickDropZone(zones, 100, 100)).toBe('usb');
    expect(pickDropZone(zones, 99, 100)).toBeNull();
  });

  it('pomija strefy o zerowym polu (ukryte aplikacje)', () => {
    expect(pickDropZone(zones, 0, 0)).toBeNull();
  });

  it('przy nakładających się strefach wygrywa najmniejsza', () => {
    const nested: DropZoneRect[] = [
      { id: 'outer', rect: rect(0, 0, 500, 500) },
      { id: 'inner', rect: rect(100, 100, 200, 200) }
    ];
    expect(pickDropZone(nested, 150, 150)).toBe('inner');
    expect(pickDropZone(nested, 300, 300)).toBe('outer');
  });

  it('respektuje accepts: strefa odrzucająca element jest pomijana', () => {
    expect(pickDropZone(zones, 150, 150, (id) => id !== 'usb')).toBeNull();
  });
});

describe('pressDrag / moveDrag / releaseDrag', () => {
  const accepts = (_item: string, zone: string) => zone !== 'desktop_hacker' || _item === 'file_a';

  it('ruch poniżej progu to jeszcze nie przeciąganie (brak ducha i strefy)', () => {
    const s = moveDrag(pressDrag('file_a', 10, 10), 12, 12, zones, accepts);
    expect(s.moved).toBe(false);
    expect(s.overZone).toBeNull();
  });

  it('po przekroczeniu progu stan „moved” zostaje, nawet gdy kursor wróci blisko startu', () => {
    let s = moveDrag(pressDrag('file_a', 10, 10), 10 + DEFAULT_DRAG_THRESHOLD, 10, zones, accepts);
    expect(s.moved).toBe(true);
    s = moveDrag(s, 11, 10, zones, accepts);
    expect(s.moved).toBe(true);
  });

  it('nad strefą przyjmującą element podaje jej id, nad odrzucającą null', () => {
    let s = moveDrag(pressDrag('file_a', 500, 500), 150, 150, zones, accepts);
    expect(s.overZone).toBe('usb');
    s = moveDrag(pressDrag('file_b', 500, 500), 800, 100, zones, accepts);
    expect(s.overZone).toBeNull();
    s = moveDrag(pressDrag('file_a', 500, 500), 800, 100, zones, accepts);
    expect(s.overZone).toBe('desktop_hacker');
  });

  it('puszczenie w strefie = drop; poza strefą po przeciągnięciu = miss; bez ruchu = tap', () => {
    const start = pressDrag('file_a', 500, 500);
    expect(releaseDrag(start, 150, 150, zones, accepts)).toEqual({
      kind: 'drop',
      itemId: 'file_a',
      zoneId: 'usb',
      x: 150,
      y: 150
    });
    expect(releaseDrag(start, 600, 600, zones, accepts).kind).toBe('miss');
    expect(releaseDrag(start, 502, 501, zones, accepts).kind).toBe('tap');
  });

  it('stuknięcie nad strefą (bez ruchu) to nadal tap, nie drop', () => {
    expect(releaseDrag(pressDrag('file_a', 150, 150), 151, 150, zones, accepts).kind).toBe('tap');
  });

  it('własny próg', () => {
    const s = moveDrag(pressDrag('file_a', 0, 0), 10, 0, zones, accepts, 20);
    expect(s.moved).toBe(false);
    expect(releaseDrag(pressDrag('file_a', 0, 0), 25, 0, zones, accepts, 20).kind).toBe('miss');
  });
});
