import { describe, it, expect } from 'vitest';
import { fillLmsPopupWindow } from '../src/engine/scorm/lmsFrame';

/** Minimalna strona odtwarzacza Moodle (zamiast DOM): rejestruje dodane style i atrybuty. */
function fakeGameWindow(player: { search: string; opener?: unknown } | null) {
  const attrs: Record<string, string> = {};
  const frame = { setAttribute: (name: string, value: string) => { attrs[name] = value; } };
  const styles: Array<{ id: string; textContent: string }> = [];
  const doc = {
    head: { appendChild: (el: { id: string; textContent: string }) => styles.push(el) },
    getElementById: (id: string) => styles.find((s) => s.id === id) ?? null,
    createElement: () => ({ id: '', textContent: '' })
  };
  const parent = player
    ? { location: { search: player.search }, opener: player.opener ?? null, document: doc }
    : null;
  const win: any = { frameElement: player ? frame : null };
  win.parent = parent ?? win;
  return { win: win as Window, attrs, styles };
}

describe('fillLmsPopupWindow — odtwarzacz SCORM Moodle', () => {
  it('w trybie popup oznacza iframe gry i dodaje arkusz rozciągający go na całe okno', () => {
    const { win, attrs, styles } = fakeGameWindow({ search: '?a=1&scoid=2&display=popup&mode=normal' });

    expect(fillLmsPopupWindow(win)).toBe(true);
    expect(attrs).toHaveProperty('data-hackers-os-frame');
    expect(styles).toHaveLength(1);
    expect(styles[0].textContent).toContain('[data-hackers-os-frame]');
    expect(styles[0].textContent).toContain('height: 100vh !important');
    expect(styles[0].textContent).toContain('overflow: hidden !important');
  });

  it('nie dubluje arkusza przy ponownym wywołaniu', () => {
    const { win, styles } = fakeGameWindow({ search: '?display=popup' });
    fillLmsPopupWindow(win);
    fillLmsPopupWindow(win);
    expect(styles).toHaveLength(1);
  });

  it('rozpoznaje popup także po window.opener (bez parametru display)', () => {
    const { win } = fakeGameWindow({ search: '?a=1', opener: {} });
    expect(fillLmsPopupWindow(win)).toBe(true);
  });

  it('w trybie osadzonym (bieżące okno Moodle) niczego nie zmienia', () => {
    const { win, attrs, styles } = fakeGameWindow({ search: '?a=1&scoid=2' });
    expect(fillLmsPopupWindow(win)).toBe(false);
    expect(attrs).toEqual({});
    expect(styles).toEqual([]);
  });

  it('poza iframe (dev, samodzielna karta) niczego nie zmienia', () => {
    const { win } = fakeGameWindow(null);
    expect(fillLmsPopupWindow(win)).toBe(false);
  });

  it('przy braku dostępu do strony odtwarzacza (inna domena) kończy bez błędu', () => {
    const win: any = {
      frameElement: { setAttribute: () => {} },
      get parent() {
        return {
          get location(): never {
            throw new DOMException('Blocked a frame with origin', 'SecurityError');
          }
        };
      }
    };
    expect(fillLmsPopupWindow(win as Window)).toBe(false);
  });
});
