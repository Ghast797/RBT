import { describe, it, expect } from 'vitest';
import { builderConfig as cfg, mission4Stages } from '../src/scenarios/mission_04_energy_rock/stages';
import {
  evaluatePassword,
  buildPasswordReport,
  randomPreview,
  buildNoteReport,
  isNoteComplete,
  tileFitsSlot
} from '../src/scenarios/mission_04_energy_rock/minigames/ransomLogic';

const four = ['pw_upper', 'pw_lower', 'pw_digits', 'pw_special'];

describe('M4 kreator: hasło', () => {
  it('tabela siły', () => {
    expect(evaluatePassword(cfg.password, [...four, 'pw_space'], 24).score).toBe(1);
    expect(evaluatePassword(cfg.password, ['pw_national'], 24).tier).toBe('critical');
    expect(evaluatePassword(cfg.password, four, 8)).toMatchObject({ score: 2, tier: 'critical' });
    expect(evaluatePassword(cfg.password, four, 24)).toMatchObject({ score: 5, tier: 'ideal', sets: 4 });
    expect(evaluatePassword(cfg.password, four, 20).score).toBe(4);
    expect(evaluatePassword(cfg.password, four.slice(0, 3), 24).score).toBe(4);
    expect(evaluatePassword(cfg.password, four, 12).score).toBe(3);
    expect(evaluatePassword(cfg.password, four.slice(0, 2), 24).score).toBe(3);
    expect(evaluatePassword(cfg.password, four, 12).tier).toBe('suboptimal');
  });
  it('odpowiedź do raportu', () => {
    expect(buildPasswordReport(cfg.password, evaluatePassword(cfg.password, four, 24)).answer).toBe(cfg.password.answers.ideal);
    const r = buildPasswordReport(cfg.password, evaluatePassword(cfg.password, four.slice(0, 3), 12));
    expect(r.answer).toBe('3 (DŁUGOŚĆ 12, ZESTAWY ZNAKÓW: 3)');
    expect(r.num).toBe(2);
  });
  it('podgląd hasła', () => {
    const p = randomPreview(cfg.password.tiles, ['pw_digits'], 10);
    expect(p).toMatch(/^[0-9]{10}$/);
    expect(randomPreview(cfg.password.tiles, [], 10)).toBe('');
    expect(randomPreview(cfg.password.tiles, four, 4)).toHaveLength(4);
  });
});

describe('M4 kreator: komunikat', () => {
  const fillOf = (title: string, time: string) => ({
    icon: 'note_icon', title, time, amount: 'note_amount', address: 'note_address', contact: 'note_contact'
  });
  it('kompletność i typ slotu', () => {
    expect(isNoteComplete(cfg.note, {})).toBe(false);
    expect(isNoteComplete(cfg.note, fillOf('title_encrypted', 'time_30h'))).toBe(true);
    const icon = cfg.note.tiles.find((t) => t.id === 'note_icon')!;
    expect(tileFitsSlot(icon, 'icon')).toBe(true);
    expect(tileFitsSlot(icon, 'title')).toBe(false);
  });
  it('poziom = gorszy z tytułu i czasu', () => {
    const ideal = buildNoteReport(cfg.note, fillOf('title_encrypted', 'time_30h'));
    expect(ideal).toMatchObject({ tier: 'ideal', answer: 'OSTRZEŻENIE + LIMIT 30 H', num: 3 });
    expect(buildNoteReport(cfg.note, fillOf('title_casual', 'time_30h')).tier).toBe('suboptimal');
    // 30 minut to B2 (mentor odrzuca w kreatorze), więc poziom raportu to suboptimal, nie critical.
    const worse = buildNoteReport(cfg.note, fillOf('title_casual', 'time_30s'));
    expect(worse.tier).toBe('suboptimal');
    expect(worse.feedback).toContain(cfg.note.tiles.find((t) => t.id === 'time_30s')!.feedback);
  });
});

describe('M4 kreator: czas w komunikacie (M4-07)', () => {
  const tileOf = (id: string) => cfg.note.tiles.find((t) => t.id === id)!;
  it('kafelki czasu: 30 GODZIN (ideal) i 30 MINUT (suboptimal, nie sekundy)', () => {
    expect(tileOf('time_30h').label).toBe('POZOSTAŁY CZAS: 30 GODZIN');
    expect(tileOf('time_30h').tier).toBe('ideal');
    expect(tileOf('time_30s').label).toBe('POZOSTAŁY CZAS: 30 MINUT');
    expect(tileOf('time_30s').tier).toBe('suboptimal');
    expect(tileOf('time_30s').reject?.mentorLine).toContain('30 MINUT');
    expect(tileOf('time_30s').reject?.mentorLine).not.toContain('SEKUND');
    expect(tileOf('time_30s').feedback).toContain('30 minut');
  });
  it('raport dla krótkiego czasu: odpowiedź „LIMIT 30 MIN”', () => {
    const r = buildNoteReport(cfg.note, { icon: 'note_icon', title: 'title_encrypted', time: 'time_30s', amount: 'note_amount', address: 'note_address', contact: 'note_contact' });
    expect(r).toMatchObject({ num: 3, tier: 'suboptimal', answer: 'OSTRZEŻENIE + LIMIT 30 MIN' });
  });
});

describe('M4 most: podpowiedź mentora o temacie maila (M4-09)', () => {
  it('odpowiedź mentora po pytaniu o wytyczne podaje dopisek CV oraz imię i nazwisko kandydata', () => {
    const builder = mission4Stages.find((s) => s.id === 'ransomware_builder')!;
    const beats = builder.completion!.conversation!;
    const idx = beats.findIndex((b) => b.from === 'player' && 'label' in b && b.label === 'MAJĄ JAKIEŚ WYTYCZNE DOTYCZĄCE TEMATU MAILA Z CV?');
    expect(idx).toBeGreaterThan(-1);
    const next = beats[idx + 1] as { from: string; text: string };
    expect(next.from).toBe('byte_master');
    expect(next.text).toBe('TEMAT MAILA POWINIEN ZAWIERAĆ DOPISEK CV ORAZ IMIĘ I NAZWISKO KANDYDATA');
  });
});

describe('M4: teksty kroków i przeskok czasu (przegląd spójności)', () => {
  it('zadania kreatora nie mają prefiksu KROK N: (numer jest w nagłówku)', () => {
    expect(cfg.note.task).not.toMatch(/^KROK \d/);
    expect(cfg.color.task).not.toMatch(/^KROK \d/);
    expect(cfg.password.task).not.toMatch(/^KROK \d/);
  });

  it('komunikat 5/5 mówi o liczbie znaków', () => {
    expect(cfg.password.strengthMessages[5]).toContain('MAKSYMALNEJ LICZBY ZNAKÓW');
  });

  it('słabsza ścieżka ma własny podpis przeskoku czasu', () => {
    const json = JSON.stringify(mission4Stages);
    expect(json).toContain('REKRUTER OTWIERA CV Z OPÓŹNIENIEM…');
    expect(json.match(/DO GODZIN PRACY REKRUTERA…/g)).toHaveLength(1);
  });
});
