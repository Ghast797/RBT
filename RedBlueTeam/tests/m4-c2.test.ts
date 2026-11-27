import { describe, expect, it } from 'vitest';
import { buildExfilReport, countSelection, exfilTier, listNames } from '../src/scenarios/mission_04_energy_rock/minigames/exfilLogic';
import { c2Config } from '../src/scenarios/mission_04_energy_rock/stages';

const { exfil } = c2Config;
const ids = (...names: string[]) => exfil.files.filter((f) => names.includes(f.name)).map((f) => f.id);
const TARGETS = ['FVOLT_TECH.DOCX', 'FREEVOLT_SCHEMAT.PDF', 'ENERGIA_FVOLT.XCF'];

describe('M4 D8: eksfiltracja', () => {
  it('config: 12 plików, 3 cele, 8 węzłów', () => {
    expect(exfil.files).toHaveLength(12);
    expect(exfil.files.filter((f) => f.role === 'target')).toHaveLength(3);
    expect(c2Config.encrypt.nodes).toHaveLength(8);
  });

  it('3 cele i 0 pozostałych = ideal z odpowiedzią z configu', () => {
    const r = buildExfilReport(exfil, ids(...TARGETS));
    expect(r.tier).toBe('ideal');
    expect(r.answer).toBe(exfil.answers.ideal);
    expect(r.num).toBe(8);
    expect(r.feedback).toBe(exfil.feedback.ideal);
  });

  it('wszystkie cele + nadmiarowe pliki = ideal, odpowiedź z dopiskiem', () => {
    const one = buildExfilReport(exfil, ids(...TARGETS, 'SEKRET.TXT'));
    expect(one.tier).toBe('ideal');
    expect(one.answer).toBe(`${exfil.answers.ideal} + 1 INNY`);
    expect(one.feedback).toBe(exfil.feedback.ideal);
    const two = buildExfilReport(exfil, ids(...TARGETS, 'SEKRET.TXT', 'MAREK.JPG'));
    expect(two.answer).toBe(`${exfil.answers.ideal} + 2 INNE`);
    const five = buildExfilReport(exfil, ids(...TARGETS, 'SEKRET.TXT', 'MAREK.JPG', 'MATERIALY.TXT', 'UMOWA2022.PDF', 'WYPOWIEDZENIE.PDF'));
    expect(five.answer).toBe(`${exfil.answers.ideal} + 5 INNYCH`);
  });

  it('1–2 cele = suboptimal z listą nazw i feedbackiem częściowym', () => {
    const one = buildExfilReport(exfil, ids(TARGETS[0]));
    expect(one.tier).toBe('suboptimal');
    expect(one.answer).toBe('1 Z 3 PLIKÓW FREEVOLT (FVOLT_TECH.DOCX)');
    expect(one.feedback).toBe(exfil.feedback.suboptimal);
    expect(buildExfilReport(exfil, ids(TARGETS[0], 'MAREK.JPG')).tier).toBe('suboptimal');
    expect(buildExfilReport(exfil, ids(TARGETS[0], TARGETS[1], 'SEKRET.TXT')).tier).toBe('suboptimal');
  });

  it('brak celów z wieloma plikami = critical z modalem porażki', () => {
    const r = buildExfilReport(exfil, ids('MAREK.JPG', 'SEKRET.TXT', 'MATERIALY.TXT', 'UMOWA2022.PDF', 'WYPOWIEDZENIE.PDF'));
    expect(r.tier).toBe('critical');
    expect(r.failTitle).toBe(exfil.failTitle);
  });

  it('same pliki fałszywe = critical', () => {
    const r = buildExfilReport(exfil, ids('MAREK.JPG', 'SEKRET.TXT'));
    expect(r.tier).toBe('critical');
    expect(r.feedback).toBe(exfil.feedback.critical);
  });

  it('countSelection liczy cele i pozostałe', () => {
    expect(countSelection(exfil.files, ids(TARGETS[0], 'MAREK.JPG', 'SEKRET.TXT'))).toEqual({ t: 1, f: 2 });
    expect(exfilTier({ t: 0, f: 0 }, 3)).toBe('critical');
  });

  it('lista nazw: maks. 3 + wielokropek', () => {
    expect(listNames(exfil.files, ids('MAREK.JPG', 'SEKRET.TXT'))).toBe('MAREK.JPG, SEKRET.TXT');
    const four = listNames(exfil.files, ids('MAREK.JPG', 'SEKRET.TXT', 'MATERIALY.TXT', 'UMOWA2022.PDF'));
    expect(four.endsWith(', …')).toBe(true);
    expect(four.split(',').length).toBe(4);
  });
});
