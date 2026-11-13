import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useMissionStore, DEFAULT_FAIL_TITLE } from '../src/engine/store/useMissionStore';
import { scorm2004 } from '../src/engine/scorm/scorm2004';
import { buildReport, buildRejection, submitDecision } from '../src/engine/core/report';
import { decisionPenalty, scoreFromDecisions, countedTier } from '../src/engine/core/scoring';
import { isRejected, scopeAttempts } from '../src/engine/components/MentorRejectNotice';
import { buildNoteRejection, buildPasswordRejection, evaluatePassword, passwordOptionId } from '../src/scenarios/mission_04_energy_rock/minigames/ransomLogic';
import { vpnSenderRejection } from '../src/engine/blocks/VpnRouter';
import type { ChoiceOption } from '../src/engine/types/mission';

// ENG-15 (failTitle/failText) i B2 (reject: mentor odrzuca wybór) — logika store'u i raportu.
const MISSION_ID = 'mission-1-petrolog';
const store = () => useMissionStore.getState();

const report = (num: number, tier: 'ideal' | 'suboptimal' | 'critical', extra: Record<string, unknown> = {}) =>
  store().reportDecision({ num, question: `Q${num}`, answer: `A${num}`, feedback: 'feedback opcji', tier, ...extra });
const reject = (num: number, answer: string, tier: 'ideal' | 'suboptimal' | 'critical' = 'suboptimal', optionId = `id_${answer}`) =>
  store().rejectDecision({ num, question: `Q${num}`, optionId, answer, tier, mentorLine: `Nie ${answer}` });

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
    expect(rejectDecision).toHaveBeenCalledWith({ num: 4, question: 'q', optionId: 'o', answer: 'KEYLOGGER', tier: 'suboptimal', mentorLine: 'Nie.' });
    expect(onDecision).not.toHaveBeenCalled();
    expect(submitDecision(d, option({ tier: 'ideal' }), { onDecision, rejectDecision })).toBe('reported');
    expect(onDecision).toHaveBeenCalledOnce();
    expect(buildRejection(d, option())).toBeNull();
  });

  it('scoreFromDecisions bez odrzuceń = max − Σ kar z poziomów', () => {
    expect(scoreFromDecisions({ 1: 'suboptimal', 2: 'critical' }, {}, 100, 4)).toBe(100 - 12.5 - 25);
  });
});

describe('B2: dopasowanie po id opcji (nie po etykiecie)', () => {
  it('ta sama opcja (id) odrzucona drugi raz jest ignorowana, także przy innym tekście odpowiedzi', () => {
    reject(1, 'CEL: WIKTORIA', 'suboptimal', 'target_wiktoria');
    const once = store().score;
    reject(1, 'Wiktoria (inny tekst w raporcie)', 'suboptimal', 'target_wiktoria');
    expect(store().score).toBe(once);
    expect(store().rejectedAttempts[1]).toHaveLength(1);
    expect(store().rejectedAttempts[1][0].optionId).toBe('target_wiktoria');
  });

  it('dwie różne opcje o tej samej etykiecie to dwie próby', () => {
    reject(1, 'TAK', 'suboptimal', 'a');
    reject(1, 'TAK', 'suboptimal', 'b');
    expect(store().rejectedAttempts[1]).toHaveLength(2);
  });

  it('isRejected blokuje kartę po id, nawet gdy reportAnswer różni się od label', () => {
    reject(1, 'CEL: AGNIESZKA (reportAnswer)', 'suboptimal', 'target_agnieszka');
    const attempts = store().rejectedAttempts[1];
    expect(isRejected(attempts, 'target_agnieszka')).toBe(true);
    expect(isRejected(attempts, 'AGNIESZKA')).toBe(false);
  });

  it('buildRejection niesie id opcji i odpowiedź z reportAnswer', () => {
    const o = { ...option({ id: 'target_x', label: 'X', reject: { mentorLine: 'Nie.' }, tier: 'suboptimal' }), reportAnswer: 'CEL: X' };
    expect(buildRejection({ decisionNum: 2, question: 'q' }, o)).toMatchObject({ optionId: 'target_x', answer: 'CEL: X' });
  });

  it('scopeAttempts zawęża komunikat do opcji z danego ekranu', () => {
    reject(1, 'NAZWA', 'suboptimal', 'vol_1');
    reject(1, 'PODPIS', 'suboptimal', 'sig_1');
    const all = store().rejectedAttempts[1];
    expect(scopeAttempts(all, ['sig_1', 'sig_2']).map((a) => a.optionId)).toEqual(['sig_1']);
  });
});

describe('B2: liczniki raportu', () => {
  it('ideał po odrzuconej próbie liczy się jako DOBRE, wynik bez zmian', () => {
    const base = store();
    const perfect0 = base.perfectChoicesCount;
    reject(1, 'X', 'suboptimal', 'x');
    const scoreAfterReject = store().score;
    report(1, 'ideal');
    const s = store();
    expect(s.score).toBe(scoreAfterReject);
    expect(s.goodChoicesCount).toBe(base.goodChoicesCount + 1);
    expect(s.perfectChoicesCount).toBe(perfect0 - 1);
  });

  it('ideał bez odrzuceń nadal liczy się jako IDEALNE', () => {
    const base = store();
    report(1, 'ideal');
    expect(store().goodChoicesCount).toBe(base.goodChoicesCount);
    expect(store().perfectChoicesCount).toBe(base.perfectChoicesCount);
  });

  it('countedTier: tylko ideał po odrzuceniu schodzi do suboptimal', () => {
    expect(countedTier('ideal', true)).toBe('suboptimal');
    expect(countedTier('ideal', false)).toBe('ideal');
    expect(countedTier('critical', true)).toBe('critical');
    expect(countedTier('suboptimal', true)).toBe('suboptimal');
  });
});

describe('B2: wyliczane oceny M4 (hasło D2, komunikat D3) i VPN D7', () => {
  const tiles = [
    { id: 'lower', label: 'a-z', charset: 'abc' },
    { id: 'upper', label: 'A-Z', charset: 'ABC' },
    { id: 'digits', label: '0-9', charset: '123' },
    { id: 'special', label: '!@#', charset: '!@#' },
    { id: 'space', label: 'spacja', charset: ' ', forbidden: true }
  ];
  const pw = (rejectLine?: (ev: { tier: string }) => string | undefined) =>
    ({
      decisionNum: 2, question: 'HASŁO', criticalLength: 8, idealLength: 24, idealSets: 4, tiles,
      answers: { ideal: 'IDEAŁ', other: '{score} (DŁ. {length}, ZESTAWY: {sets})' },
      feedback: { ideal: 'i', suboptimal: 's', critical: 'c' },
      rejectLine
    }) as never;

  it('hasło: bez rejectLine ocena idzie zwykłą drogą (null)', () => {
    const cfg = pw();
    expect(buildPasswordRejection(cfg, evaluatePassword(cfg, ['lower'], 8), ['lower'])).toBeNull();
  });

  it('hasło: rejectLine zwraca kwestię mentora dla critical, a nie dla ideal', () => {
    const cfg = pw((ev) => (ev.tier === 'critical' ? 'Za słabe, ustaw mocniejsze.' : undefined));
    const weak = evaluatePassword(cfg, ['lower'], 8);
    const r = buildPasswordRejection(cfg, weak, ['lower']);
    expect(r).toMatchObject({ num: 2, tier: 'critical', mentorLine: 'Za słabe, ustaw mocniejsze.', answer: '2 (DŁ. 8, ZESTAWY: 1)' });
    expect(r!.optionId).toBe(passwordOptionId(['lower'], 8));
    const strong = evaluatePassword(cfg, ['lower', 'upper', 'digits', 'special'], 24);
    expect(buildPasswordRejection(cfg, strong, ['lower', 'upper', 'digits', 'special'])).toBeNull();
  });

  it('hasło: ta sama konfiguracja (inna kolejność kafelków) ma to samo id; odrzucona drugi raz nie liczy kary', () => {
    expect(passwordOptionId(['b', 'a'], 8)).toBe(passwordOptionId(['a', 'b'], 8));
    const cfg = pw(() => 'Nie.');
    const ev = evaluatePassword(cfg, ['lower'], 8);
    const r = buildPasswordRejection(cfg, ev, ['lower'])!;
    store().rejectDecision(r);
    const once = store().score;
    store().rejectDecision(r);
    expect(store().score).toBe(once);
    expect(store().rejectedAttempts[2]).toHaveLength(1);
  });

  const noteCfg = {
    decisionNum: 3, question: 'KOMUNIKAT',
    tiles: [
      { id: 't_ok', slot: 'title', label: 'OK', tier: 'ideal' },
      { id: 't_bad', slot: 'title', label: 'ZŁY', tier: 'critical', reportPart: 'ZŁY TYTUŁ', reject: { mentorLine: 'Zły ton.' } },
      { id: 'c_bad', slot: 'time', label: '24H', tier: 'suboptimal', reject: { mentorLine: 'Za mało czasu.' } },
      { id: 'c_ok', slot: 'time', label: '30H', tier: 'ideal' }
    ]
  } as never;

  it('komunikat: brak kafelka z reject = null', () => {
    expect(buildNoteRejection(noteCfg, { title: 't_ok', time: 'c_ok' })).toBeNull();
  });

  it('komunikat: odrzuca najpierw gorszy kafelek i wskazuje slot do opróżnienia', () => {
    const r = buildNoteRejection(noteCfg, { title: 't_bad', time: 'c_bad' })!;
    expect(r.slot).toBe('title');
    expect(r.rejection).toMatchObject({ num: 3, optionId: 't_bad', answer: 'ZŁY TYTUŁ', tier: 'critical', mentorLine: 'Zły ton.' });
    expect(buildNoteRejection(noteCfg, { title: 't_ok', time: 'c_bad' })!.slot).toBe('time');
  });

  it('VPN D7: nadawca z reject daje odrzucenie z odpowiedzią IP + nadawca', () => {
    const sender = { decisionNum: 7, question: 'Q', options: [], includeIpInAnswer: true };
    const opt = { id: 's1', label: 'M.WILK', tier: 'suboptimal' as const, feedback: 'f', reject: { mentorLine: 'Nie ten.' } };
    expect(vpnSenderRejection(sender, opt, '1.2.3.4')).toMatchObject({ num: 7, optionId: 's1', answer: '1.2.3.4 + M.WILK', mentorLine: 'Nie ten.' });
    expect(vpnSenderRejection(sender, { ...opt, reject: undefined }, '1.2.3.4')).toBeNull();
  });
});
