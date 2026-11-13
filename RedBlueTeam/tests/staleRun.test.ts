import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useMissionStore, __setBridgeDelayForTests } from '../src/engine/store/useMissionStore';
import { guardByRun, createTimerBag } from '../src/engine/core/runGuard';
import { mission1Definition } from '../src/scenarios/mission_01_petrolog';

describe('ENG-08: opóźnione callbacki klocka a powtórka misji', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    __setBridgeDelayForTests(0);
    useMissionStore.getState().loadMission(mission1Definition);
    useMissionStore.getState().finishBiosBoot();
  });
  afterEach(() => {
    vi.useRealTimers();
    __setBridgeDelayForTests(2000);
  });

  const stageId = () => mission1Definition.stages![0].id;

  it('callback z poprzedniego runu jest ignorowany po resecie w trakcie opóźnienia', () => {
    const st = useMissionStore.getState();
    const run = st.appRunId;
    const getRun = () => useMissionStore.getState().appRunId;
    const complete = guardByRun(getRun, run, st.completeStage);

    setTimeout(() => complete(stageId()), 1600); // jak ostatnia kwestia DialogueTree
    vi.advanceTimersByTime(800);
    useMissionStore.getState().retryFromChoices();
    vi.advanceTimersByTime(1000);

    expect(useMissionStore.getState().completedStages).not.toContain(stageId());
  });

  it('callback z bieżącego runu działa', () => {
    const st = useMissionStore.getState();
    guardByRun(() => useMissionStore.getState().appRunId, st.appRunId, st.completeStage)(stageId());
    expect(useMissionStore.getState().completedStages).toContain(stageId());
  });

  it('timerBag.clear() anuluje oczekujące timery (cleanup przy odmontowaniu)', () => {
    const bag = createTimerBag();
    const fn = vi.fn();
    bag.later(fn, 1600);
    vi.advanceTimersByTime(800);
    bag.clear();
    vi.advanceTimersByTime(1000);
    expect(fn).not.toHaveBeenCalled();
  });
});

describe('ENG-05: odpowiedź i reakcja mentora z intra', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    __setBridgeDelayForTests(0);
    useMissionStore.getState().loadMission(mission1Definition);
  });
  afterEach(() => {
    vi.useRealTimers();
    __setBridgeDelayForTests(2000);
  });

  const optB = () => {
    const d = (mission1Definition.intro as any).dialogue.find((x: any) => x.id === 'node_7');
    return d.playerOptions.find((o: any) => o.id === 'opt_b');
  };

  it('historia czatu zawiera wybraną odpowiedź i reakcję mentora, nie idealną', () => {
    const o = optB();
    useMissionStore.getState().recordIntroReply({ dialogId: 'node_7', text: o.label });
    useMissionStore.getState().finishBiosBoot();
    const texts = useMissionStore.getState().chatMessages.map((m) => m.text);
    expect(texts).toContain(o.label);
    expect(texts).toContain(o.mentorReaction);
    const a = (mission1Definition.intro as any).dialogue.find((x: any) => x.id === 'node_7').playerOptions[0];
    expect(texts).not.toContain(a.mentorReaction);
  });

  it('„BEZ INTRO” (retryFromChoices) zachowuje wybraną odpowiedź i reakcję', () => {
    const o = optB();
    useMissionStore.getState().recordIntroReply({ dialogId: 'node_7', text: o.label });
    useMissionStore.getState().finishBiosBoot();
    useMissionStore.getState().retryFromChoices();
    const st = useMissionStore.getState();
    expect(st.introReplies['node_7']).toBe(o.label);
    const texts = st.chatMessages.map((m) => m.text);
    expect(texts).toContain(o.label);
    expect(texts).toContain(o.mentorReaction);
  });

  it('pełny reset „OD POCZĄTKU” czyści odpowiedzi z intra', () => {
    useMissionStore.getState().recordIntroReply({ dialogId: 'node_7', text: 'x' });
    useMissionStore.getState().retryFromScratch();
    expect(useMissionStore.getState().introReplies).toEqual({});
  });
});
