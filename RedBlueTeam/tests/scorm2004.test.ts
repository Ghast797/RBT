import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatIso8601Duration, MockSCORM2004, scorm2004 } from '../src/engine/scorm/scorm2004';
import { useMissionStore } from '../src/engine/store/useMissionStore';

describe('SCORM 2004 (4th Edition) Engine', () => {
  beforeEach(() => {
    scorm2004.reset();
    useMissionStore.getState().resetGame();
  });

  it('correctly formats seconds into ISO 8601 duration strings', () => {
    expect(formatIso8601Duration(0)).toBe('PT0S');
    expect(formatIso8601Duration(42)).toBe('PT42S');
    expect(formatIso8601Duration(95)).toBe('PT1M35S');
    expect(formatIso8601Duration(3600)).toBe('PT1H0M0S');
    expect(formatIso8601Duration(3665)).toBe('PT1H1M5S');
  });

  it('handles MockSCORM2004 lifecycle and data store', () => {
    const mock = new MockSCORM2004();
    expect(mock.isInitialized).toBe(false);

    mock.Initialize('');
    expect(mock.isInitialized).toBe(true);
    expect(mock.GetValue('cmi.completion_status')).toBe('incomplete');

    mock.SetValue('cmi.score.raw', '95');
    expect(mock.GetValue('cmi.score.raw')).toBe('95');

    mock.Commit('');
    expect(mock.commitCount).toBe(1);

    mock.Terminate('');
    expect(mock.isTerminated).toBe(true);
  });

  it('submits final score >= 70 with passed status', () => {
    const res = scorm2004.submitFinalScore({
      scoreRaw: 85,
      passingScore: 70,
      sessionSeconds: 120
    });

    expect(res.success).toBe(true);
    expect(res.message).toContain('ZALICZONY');

    const api = scorm2004.getApi() as MockSCORM2004;
    expect(api.GetValue('cmi.completion_status')).toBe('completed');
    expect(api.GetValue('cmi.success_status')).toBe('passed');
    expect(api.GetValue('cmi.score.raw')).toBe('85');
    expect(api.GetValue('cmi.score.scaled')).toBe('0.85');
  });

  it('submits failed status when score is below 70%', () => {
    const res = scorm2004.submitFinalScore({
      scoreRaw: 60,
      passingScore: 70,
      sessionSeconds: 80
    });

    expect(res.success).toBe(true);
    expect(res.message).toContain('NIEZALICZONY');

    const api = scorm2004.getApi() as MockSCORM2004;
    expect(api.GetValue('cmi.success_status')).toBe('failed');
    expect(api.GetValue('cmi.score.raw')).toBe('60');
  });

  it('integrates with useMissionStore submitScormAndExit', () => {
    const store = useMissionStore.getState();
    store.finishBiosBoot();

    expect(useMissionStore.getState().isScormSubmitted).toBe(false);
    expect(useMissionStore.getState().isExitModalOpen).toBe(false);

    const result = store.submitScormAndExit();
    expect(result.success).toBe(true);

    const updatedState = useMissionStore.getState();
    expect(updatedState.isScormSubmitted).toBe(true);
    expect(updatedState.isExitModalOpen).toBe(true);
    expect(updatedState.scormSubmitMessage).toContain('pomyślnie');

    store.closeExitModal();
    expect(useMissionStore.getState().isExitModalOpen).toBe(false);

    store.openExitModal();
    expect(useMissionStore.getState().isExitModalOpen).toBe(true);
  });
});


describe('SCORM 2004 — LMS (strict): ponowna inicjalizacja i najlepszy wynik', () => {
  const strictLms = () => {
    const lms = new MockSCORM2004();
    lms.strict = true;
    (globalThis as any).window = { API_1484_11: lms, addEventListener: () => {} };
    return lms;
  };

  beforeEach(() => {
    scorm2004.reset();
    useMissionStore.getState().resetGame();
  });

  afterEach(() => {
    delete (globalThis as any).window;
  });

  it('initialize() jest idempotentne i traktuje błąd 103 jako połączenie', () => {
    const lms = strictLms();
    expect(scorm2004.initialize(false)).toBe(true);
    expect(scorm2004.initialize(false)).toBe(true);
    scorm2004.reset();
    expect(scorm2004.initialize(false)).toBe(true);
    expect(lms.GetLastError()).toBe('103');
  });

  it('critical -> OD POCZĄTKU -> ukończenie: wynik trafia do LMS', () => {
    const lms = strictLms();
    useMissionStore.getState().finishBiosBoot();
    useMissionStore.getState().resetGame();
    useMissionStore.getState().finishBiosBoot();
    const res = useMissionStore.getState().saveMissionResult();
    expect(res.success).toBe(true);
    expect(lms.GetValue('cmi.score.raw')).not.toBe('');
  });

  it('zapisuje najlepszy wynik: 100 -> powtórka 75 zostawia 100 i passed', () => {
    const lms = strictLms();
    scorm2004.initialize(false);
    scorm2004.saveResult({ scoreRaw: 100, passingScore: 70, sessionSeconds: 10 });
    const res = scorm2004.saveResult({ scoreRaw: 75, passingScore: 70, sessionSeconds: 20 });
    expect(res.success).toBe(true);
    expect(lms.GetValue('cmi.score.raw')).toBe('100');
    expect(lms.GetValue('cmi.success_status')).toBe('passed');
    scorm2004.saveResult({ scoreRaw: 60, passingScore: 70, sessionSeconds: 30 });
    expect(lms.GetValue('cmi.success_status')).toBe('passed');
  });

  it('czyta dotychczasowy wynik z LMS przy inicjalizacji', () => {
    const lms = strictLms();
    const origInit = lms.Initialize.bind(lms);
    lms.Initialize = (p: string) => {
      const r = origInit(p);
      lms.data['cmi.score.raw'] = '90';
      lms.data['cmi.success_status'] = 'passed';
      return r;
    };
    scorm2004.initialize(false);
    scorm2004.saveResult({ scoreRaw: 80, passingScore: 70, sessionSeconds: 5 });
    expect(lms.GetValue('cmi.score.raw')).toBe('90');
  });

  it('zaokrągla wynik do 2 miejsc i komunikat do całości', () => {
    const lms = strictLms();
    scorm2004.initialize(false);
    const res = scorm2004.saveResult({ scoreRaw: 91.66666666666667, passingScore: 70, sessionSeconds: 5 });
    expect(lms.GetValue('cmi.score.raw')).toBe('91.67');
    expect(res.message).toContain('92/100');
  });
});


describe('SCORM 2004 — brak interakcji i suspend_data (ENG-07, ENG-10)', () => {
  it('saveMissionResult zapisuje wynik/status/czas, ale nie cmi.interactions ani cmi.suspend_data', () => {
    scorm2004.reset();
    useMissionStore.getState().resetGame();
    useMissionStore.getState().finishBiosBoot();
    useMissionStore.getState().recordChoice({ num: 1, question: 'Q', answer: 'Odpowiedź ze spacjami', isCorrect: true } as any);
    useMissionStore.getState().saveMissionResult();
    const api = scorm2004.getApi() as MockSCORM2004;
    expect(api.GetValue('cmi.score.raw')).not.toBe('');
    expect(api.GetValue('cmi.session_time')).not.toBe('');
    expect(api.GetValue('cmi.exit')).toBe('normal');
    const keys = Object.keys(api.data);
    expect(keys.filter((k) => k.startsWith('cmi.interactions'))).toEqual([]);
    expect(keys).not.toContain('cmi.suspend_data');
  });
});

describe('SCORM 2004 — blokada powtórki po wysłaniu wyniku (NEW-01)', () => {
  const strictLms = () => {
    const lms = new MockSCORM2004();
    lms.strict = true;
    (globalThis as any).window = { API_1484_11: lms, addEventListener: () => {} };
    return lms;
  };

  beforeEach(() => {
    scorm2004.reset();
    useMissionStore.setState({ isScormTerminated: false });
    useMissionStore.getState().resetGame();
  });
  afterEach(() => {
    delete (globalThis as any).window;
    scorm2004.reset();
    useMissionStore.setState({ isScormTerminated: false });
  });

  it('ścisły mock zwraca błąd 104 przy Initialize po Terminate', () => {
    const lms = new MockSCORM2004();
    lms.strict = true;
    expect(lms.Initialize('')).toBe('true');
    expect(lms.Terminate('')).toBe('true');
    expect(lms.Initialize('')).toBe('false');
    expect(lms.GetLastError()).toBe('104');
  });

  it('po udanym wysłaniu w LMS powtórka jest zablokowana i gra nie woła Initialize (104)', () => {
    const lms = strictLms();
    const initSpy = vi.spyOn(lms, 'Initialize');
    useMissionStore.getState().finishBiosBoot();
    expect(initSpy).toHaveBeenCalledTimes(1);

    expect(useMissionStore.getState().submitScormAndExit().success).toBe(true);
    expect(useMissionStore.getState().isScormTerminated).toBe(true);
    expect(lms.isTerminated).toBe(true);
    const scoreBefore = useMissionStore.getState().score;

    const st = useMissionStore.getState();
    st.openRetryModal();
    expect(useMissionStore.getState().isRetryModalOpen).toBe(false);
    st.retryFromScratch();
    st.retryFromChoices();
    st.resetGame();
    st.loadMission(st.activeMission);
    const after = useMissionStore.getState();
    expect(after.isScormTerminated).toBe(true);
    expect(after.bootStage).toBe('desktop');
    expect(after.score).toBe(scoreBefore);
    expect(after.isScormSubmitted).toBe(true);

    // Dalsze zapisy i inicjalizacje nie dochodzą do LMS
    expect(after.saveMissionResult().success).toBe(false);
    expect(scorm2004.initialize(false)).toBe(false);
    expect(initSpy).toHaveBeenCalledTimes(1);
    expect(lms.GetLastError()).not.toBe('104');
  });

  it('bez LMS (tylko Mock) powtórka nadal działa', () => {
    useMissionStore.getState().finishBiosBoot();
    expect(scorm2004.isUsingMock()).toBe(true);
    useMissionStore.getState().submitScormAndExit();
    expect(useMissionStore.getState().isScormTerminated).toBe(false);
    useMissionStore.getState().retryFromScratch();
    expect(useMissionStore.getState().bootStage).toBe('incoming_call');
  });

  it('gdy LMS odrzuci Terminate, powtórka nadal działa', () => {
    const lms = strictLms();
    useMissionStore.getState().finishBiosBoot();
    lms.Terminate = () => 'false';
    useMissionStore.getState().submitScormAndExit();
    expect(useMissionStore.getState().isScormTerminated).toBe(false);
    useMissionStore.getState().retryFromScratch();
    expect(useMissionStore.getState().bootStage).toBe('incoming_call');
  });
});
