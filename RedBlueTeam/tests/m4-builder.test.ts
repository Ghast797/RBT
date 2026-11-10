import { describe, it, expect } from 'vitest';
import { builderConfig as cfg } from '../src/scenarios/mission_04_energy_rock/stages';
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
    const crit = buildNoteReport(cfg.note, fillOf('title_casual', 'time_30s'));
    expect(crit.tier).toBe('critical');
    expect(crit.feedback).toBe(cfg.note.tiles.find((t) => t.id === 'time_30s')!.feedback);
  });
});
