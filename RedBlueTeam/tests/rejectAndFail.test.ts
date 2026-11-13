import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useMissionStore, DEFAULT_FAIL_TITLE } from '../src/engine/store/useMissionStore';
import { scorm2004 } from '../src/engine/scorm/scorm2004';
import { buildReport, buildRejection, submitDecision } from '../src/engine/core/report';
import { decisionPenalty, scoreFromDecisions } from '../src/engine/core/scoring';
import type { ChoiceOption } from '../src/engine/types/mission';

// ENG-15 (failTitle/failText) i B2 (reject: mentor odrzuca wybór) — logika store'u i raportu.
const MISSION_ID = 'mission-1-petrolog';
const store = () => useMissionStore.getState();

const report = (num: number, tier: 'ideal' | 'suboptimal' | 'critical', extra: Record<string, unknown> = {}) =>
  store().reportDecision({ num, question: `Q${num}`, answer: `A${num}`, feedback: 'feedback opcji', tier, ...extra });
const reject = (num: number, answer: string, tier: 'ideal' | 'suboptimal' | 'critical' = 'suboptimal') =>
  store().rejectDecision({ num, question: `Q${num}`, answer, tier, mentorLine: `Nie ${answer}` });

const option = (over: Partial<ChoiceOption> = {}): ChoiceOption => ({
  id: 'o', label: 'KEYLOGGER', tier: 'critical', feedback: 'fb', ...over
});

beforeEach(() => {
  scorm2004.reset();
  store().loadMission(MISSION_ID);
});

describe('ENG-15: failTitle / failText', () => {
  it('modal dostaje failTitle i failText z raportu', () => {
    report(1, 'critical', { failTitle: 'TRANSAKCJA ODRZUCONA', failText: 'Bank zablokował przelew.' });
    const s = store();
    expect(s.isDetectedModalOpen).toBe(true);
    expect(s.detectionReason?.title).toBe('TRANSAKCJA ODRZUCONA');
    expect(s.detectionReason?.details).toBe('Bank zablokował przelew.');
  });

  it('bez pól: domyślny tytuł i feedback jako szczegóły', () => {
    report(1, 'critical');
    expect(store().detectionReason?.title).toBe(DEFAULT_FAIL_TITLE);
    expect(store().detectionReason?.title).toBe('ZOSTAŁEŚ WYKRYTY!');
    expect(store().detectionReason?.details).toBe('feedback opcji');
  });

  it('buildReport przenosi pola z opcji tylko dla critical', () => {
    const o = option({ failTitle: 'T', failText: 'X' });
    expect(buildReport({ decisionNum: 1, question: 'q' }, o)).toMatchObject({ failTitle: 'T', failText: 'X' });
    const sub = buildReport({ decisionNum: 1, question: 'q' }, o, { tier: 'suboptimal' });
    expect(sub.failTitle).toBeUndefined();
    expect(buildReport({ decisionNum: 1, question: 'q' }, option())).not.toHaveProperty('failTitle');
  });
});

describe('B2: mentor odrzuca wybór', () => {
  it('nalicza karę, nie zamyka decyzji, nie otwiera modala, dopisuje kwestię do czatu', () => {
    const before = store();
    const max = before.activeMission.mission.maxScore;
    const chatBefore = before.chatMessages.length;
    reject(1, 'KEYLOGGER');
    const s = store();
    expect(s.decisionTiers[1]).toBeUndefined();
    expect(s.isDetectedModalOpen).toBe(false);
    expect(s.score).toBeLessThan(max);
    expect(s.rejectedAttempts[1]).toHaveLength(1);
    expect(s.chatMessages.length).toBe(chatBefore + 1);
    expect(s.chatMessages.at(-1)).toMatchObject({ sender: 'BYTE_MASTER', text: 'Nie KEYLOGGER' });
    expect(s.reportedDecisions).not.toContain(1);
  });

  it('ta sama odpowiedź odrzucona dwa razy liczy się raz', () => {
    reject(1, 'KEYLOGGER');
    const once = store().score;
    reject(1, 'KEYLOGGER');
    expect(store().score).toBe(once);
    expect(store().rejectedAttempts[1]).toHaveLength(1);
  });

  it('kolejny wybór zamyka decyzję; wynik = kara z tier + kara za próbę; raport niesie próbę', () => {
    reject(1, 'KEYLOGGER', 'suboptimal');
    const afterReject = store().score;
    report(1, 'ideal');
    const s = store();
    expect(s.decisionTiers[1]).toBe('ideal');
    expect(s.score).toBe(afterReject);
    const rec = s.playerChoices.find((c) => c.num === 1)!;
    expect(rec.outcome).toBe('ideal');
    expect(rec.rejectedAttempts?.[0].answer).toBe('KEYLOGGER');
  });

  it('łączna kara za decyzję nie przekracza udziału decyzji', () => {
    const max = store().activeMission.mission.maxScore;
    reject(1, 'A', 'critical');
    reject(1, 'B', 'critical');
    report(1, 'suboptimal');
    const s = store();
    const share = max / (s.activeMission.step6?.choices?.length || 1);
    expect(max - s.score).toBeLessThanOrEqual(share + 1e-9);
    expect(decisionPenalty('critical', ['critical', 'suboptimal'], 100, 4)).toBe(25);
  });

  it('po zamkniętej decyzji odrzucenie nic nie zmienia', () => {
    report(1, 'ideal');
    const score = store().score;
    reject(1, 'X');
    expect(store().score).toBe(score);
    expect(store().rejectedAttempts[1]).toBeUndefined();
  });

  it('ENG-06: pierwsze zgłoszenie wygrywa także po odrzuceniu', () => {
    reject(1, 'X', 'suboptimal');
    report(1, 'suboptimal');
    const once = store().score;
    report(1, 'ideal');
    expect(store().score).toBe(once);
    expect(store().decisionTiers[1]).toBe('suboptimal');
  });

  it('powtórka (retryFromChoices) i resetGame czyszczą odrzucenia', () => {
    reject(1, 'X');
    store().retryFromChoices();
    expect(store().rejectedAttempts).toEqual({});
    expect(store().score).toBe(store().activeMission.mission.maxScore);
    reject(1, 'X');
    store().resetGame();
    expect(store().rejectedAttempts).toEqual({});
  });

  it('zamknięcie aplikacji zachowuje odrzucenia', () => {
    reject(1, 'X');
    store().openApp('chat' as never);
    store().closeApp();
    expect(store().rejectedAttempts[1]).toHaveLength(1);
  });

  it('submitDecision kieruje opcję z reject do rejectDecision, resztę do onDecision', () => {
    const onDecision = vi.fn();
    const rejectDecision = vi.fn();
    const d = { decisionNum: 4, question: 'q' };
    expect(submitDecision(d, option({ reject: { mentorLine: 'Nie.' }, tier: 'suboptimal' }), { onDecision, rejectDecision })).toBe('rejected');
    expect(rejectDecision).toHaveBeenCalledWith({ num: 4, question: 'q', answer: 'KEYLOGGER', tier: 'suboptimal', mentorLine: 'Nie.' });
    expect(onDecision).not.toHaveBeenCalled();
    expect(submitDecision(d, option({ tier: 'ideal' }), { onDecision, rejectDecision })).toBe('reported');
    expect(onDecision).toHaveBeenCalledOnce();
    expect(buildRejection(d, option())).toBeNull();
  });

  it('scoreFromDecisions bez odrzuceń = max − Σ kar z poziomów', () => {
    expect(scoreFromDecisions({ 1: 'suboptimal', 2: 'critical' }, {}, 100, 4)).toBe(100 - 12.5 - 25);
  });
});
