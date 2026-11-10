import { describe, it, expect } from 'vitest';
import { mailConfig as cfg } from '../src/scenarios/mission_04_energy_rock/stages';
import {
  buildMailState,
  canConfirmStep,
  findOption,
  isMailComplete,
  placeInField
} from '../src/scenarios/mission_04_energy_rock/minigames/mailLogic';

describe('M4 //MAIL: logika pól', () => {
  const subj = cfg.subject.options;
  const body = cfg.body.options;

  it('findOption zwraca opcję lub undefined', () => {
    expect(findOption(subj, subj[0].id)).toBe(subj[0]);
    expect(findOption(subj, null)).toBeUndefined();
    expect(findOption(subj, 'nie_ma')).toBeUndefined();
  });

  it('placeInField zastępuje wybór i ignoruje nieznane id', () => {
    expect(placeInField(null, subj[1].id, subj)).toBe(subj[1].id);
    expect(placeInField(subj[1].id, subj[0].id, subj)).toBe(subj[0].id);
    expect(placeInField(subj[1].id, 'x', subj)).toBe(subj[1].id);
  });

  it('kroki wymagają wypełnionego pola', () => {
    expect(canConfirmStep('subject', null, null)).toBe(false);
    expect(canConfirmStep('subject', subj[0].id, null)).toBe(true);
    expect(canConfirmStep('body', subj[0].id, null)).toBe(false);
    expect(canConfirmStep('body', null, body[0].id)).toBe(true);
    expect(canConfirmStep('arm', 'a', 'b')).toBe(false);
  });

  it('kompletność i stan customState', () => {
    expect(isMailComplete(subj[0].id, null)).toBe(false);
    expect(buildMailState(subj[0].id, null)).toBeNull();
    expect(buildMailState(subj[0].id, body[1].id)).toEqual({ subjectId: subj[0].id, bodyId: body[1].id });
  });

  it('config ma 3 tematy i 3 treści oraz po jednym ideal', () => {
    expect(subj).toHaveLength(3);
    expect(body).toHaveLength(3);
    expect(subj.filter((o) => o.tier === 'ideal')).toHaveLength(1);
    expect(body.filter((o) => o.tier === 'ideal')).toHaveLength(1);
  });
});
