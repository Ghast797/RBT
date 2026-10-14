import { describe, it, expect, beforeEach } from 'vitest';
import { formatIso8601Duration, MockSCORM2004, scorm2004 } from '../src/utils/scorm2004';
import { useMissionStore } from '../src/store/useMissionStore';

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

  it('submits final score >= 70 with passed status and interactions', () => {
    const res = scorm2004.submitFinalScore({
      scoreRaw: 85,
      passingScore: 70,
      sessionSeconds: 120,
      interactions: [
        {
          id: 'step_1_choice',
          type: 'choice',
          description: 'Malware selection',
          learnerResponse: 'RAT',
          result: 'correct'
        },
        {
          id: 'step_2_choice',
          type: 'choice',
          description: 'Victim selection',
          learnerResponse: 'Mateusz Klimowicz',
          result: 'correct'
        }
      ]
    });

    expect(res.success).toBe(true);
    expect(res.message).toContain('ZALICZONY');

    const api = scorm2004.getApi() as MockSCORM2004;
    expect(api.GetValue('cmi.completion_status')).toBe('completed');
    expect(api.GetValue('cmi.success_status')).toBe('passed');
    expect(api.GetValue('cmi.score.raw')).toBe('85');
    expect(api.GetValue('cmi.score.scaled')).toBe('0.85');
    expect(api.GetValue('cmi.interactions.0.id')).toBe('step_1_choice');
    expect(api.GetValue('cmi.interactions.0.result')).toBe('correct');
    expect(api.GetValue('cmi.interactions.1.id')).toBe('step_2_choice');
    expect(api.GetValue('cmi.interactions.1.learner_response')).toBe('Mateusz Klimowicz');
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
