import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useMissionStore, __setBridgeDelayForTests } from '../src/engine/store/useMissionStore';
import { mission2Definition } from '../src/scenarios/mission_02_carbon_flow';
import type { ConversationBeat, MissionDefinition, StageDefinition } from '../src/engine/types/mission';

const opening: ConversationBeat[] = [
  { from: 'byte_master', text: 'OPIS AUTA' },
  { from: 'byte_master', text: 'DRUGA KWESTIA' }
];

/** Misja testowa: etap A (z mostkiem i przeskokiem) oraz etap B z rozmową przy otwarciu. */
function missionWith(openingB: ConversationBeat[] | undefined = opening, extra: Partial<StageDefinition> = {}): MissionDefinition {
  return {
    ...mission2Definition,
    stages: [
      {
        id: 'stage_a',
        appId: 'app_a',
        completion: {
          conversation: [
            { from: 'byte_master', text: 'MOSTEK A' },
            { from: 'time_jump', durationMs: 1000 },
            { from: 'byte_master', text: 'PO PRZESKOKU' }
          ],
          unlockIcons: ['app_b_unlocked'],
          highlightTile: 'app_b'
        }
      },
      {
        id: 'stage_b',
        appId: 'app_b',
        openingConversation: openingB,
        completion: { conversation: [{ from: 'byte_master', text: 'MOSTEK B' }] },
        ...extra
      }
    ]
  } as MissionDefinition;
}

const st = () => useMissionStore.getState();
const texts = () => st().chatMessages.map((m) => `${m.sender}:${m.text}`);

describe('StageDefinition.openingConversation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    __setBridgeDelayForTests(2000);
  });
  afterEach(() => {
    __setBridgeDelayForTests(2000);
    vi.useRealTimers();
  });

  const load = (def: MissionDefinition = missionWith()) => {
    st().loadMission(def);
    useMissionStore.setState({ bootStage: 'desktop', unlockedIcons: ['app_a', 'app_b'], chatMessages: [], notificationBadges: {} });
  };

  it('pierwsze otwarcie aplikacji gra rozmowę w czacie: pisze, opóźnienie, kolejne kwestie', () => {
    load();
    st().openApp('app_b');
    expect(st().isByteMasterTyping).toBe(true);
    expect(texts()).toEqual([]);
    vi.advanceTimersByTime(2000);
    expect(texts()).toEqual(['BYTE_MASTER:OPIS AUTA']);
    vi.advanceTimersByTime(2000);
    expect(texts()).toEqual(['BYTE_MASTER:OPIS AUTA', 'BYTE_MASTER:DRUGA KWESTIA']);
    expect(st().isByteMasterTyping).toBe(false);
    expect(st().pendingBridge).toBeNull();
  });

  it('rozmowa przy otwarciu nie odblokowuje niczego', () => {
    load();
    useMissionStore.setState({ unlockedIcons: ['app_a', 'app_b'] });
    st().openApp('app_b');
    vi.runAllTimers();
    expect(st().unlockedIcons).toEqual(['app_a', 'app_b']);
    expect(st().highlightedTileId).toBeNull();
  });

  it('gra się raz na rozgrywkę: ponowne otwarcie aplikacji jej nie powtarza', () => {
    load();
    st().openApp('app_b');
    vi.runAllTimers();
    const before = texts();
    st().closeApp();
    st().openApp('app_b');
    expect(st().pendingBridge).toBeNull();
    expect(st().isByteMasterTyping).toBe(false);
    vi.runAllTimers();
    expect(texts()).toEqual(before);
    expect(st().playedOpenings).toEqual(['stage_b']);
  });

  it('zamknięcie i otwarcie aplikacji w trakcie rozmowy nie startuje jej drugi raz', () => {
    load();
    st().openApp('app_b');
    st().closeApp();
    st().openApp('app_b');
    vi.runAllTimers();
    expect(texts()).toEqual(['BYTE_MASTER:OPIS AUTA', 'BYTE_MASTER:DRUGA KWESTIA']);
  });

  it('aplikacja bez rozmowy przy otwarciu nic nie dopisuje', () => {
    load(missionWith([]));
    st().openApp('app_b');
    expect(st().pendingBridge).toBeNull();
    vi.runAllTimers();
    expect(texts()).toEqual([]);
    expect(st().playedOpenings).toEqual([]);
  });

  it('kwestia gracza w rozmowie: przycisk w czacie, klik wysyła echo i przesuwa rozmowę', () => {
    load(
      missionWith([
        { from: 'byte_master', text: 'PYTANIE' },
        { from: 'player', id: 'op_p1', label: 'ROZUMIEM' },
        { from: 'byte_master', text: 'DOBRZE' }
      ])
    );
    st().openApp('app_b');
    vi.advanceTimersByTime(2000);
    expect(st().chatAvailableChoices.map((c) => c.id)).toEqual(['op_p1']);
    vi.advanceTimersByTime(10000); // gracz zwleka, rozmowa czeka
    expect(texts()).toEqual(['BYTE_MASTER:PYTANIE']);
    st().chooseChatOption('op_p1');
    vi.advanceTimersByTime(2000);
    expect(texts()).toEqual(['BYTE_MASTER:PYTANIE', 'PLAYER:ROZUMIEM', 'BYTE_MASTER:DOBRZE']);
    expect(st().pendingBridge).toBeNull();
  });

  describe('powtórka misji resetuje rozmowę', () => {
    for (const reset of ['retryFromChoices', 'retryFromScratch', 'resetGame', 'loadMission'] as const) {
      it(reset, () => {
        load();
        st().openApp('app_b');
        vi.runAllTimers();
        expect(st().playedOpenings).toEqual(['stage_b']);
        if (reset === 'loadMission') st().loadMission(missionWith());
        else st()[reset]();
        expect(st().playedOpenings).toEqual([]);
        expect(st().queuedOpenings).toEqual([]);
        // retryFromChoices odtwarza mostek intro (czeka na kwestię gracza); tu go pomijamy
        useMissionStore.setState({ bootStage: 'desktop', chatMessages: [], pendingBridge: null, chatAvailableChoices: [] });
        st().openApp('app_b');
        vi.runAllTimers();
        expect(texts()).toEqual(['BYTE_MASTER:OPIS AUTA', 'BYTE_MASTER:DRUGA KWESTIA']);
      });
    }

    it('powtórka w trakcie rozmowy nie dopisuje spóźnionej kwestii do nowej rozgrywki', () => {
      load();
      st().openApp('app_b');
      vi.advanceTimersByTime(1000); // pisze w toku
      st().retryFromScratch();
      useMissionStore.setState({ bootStage: 'desktop', chatMessages: [] });
      vi.advanceTimersByTime(10000);
      expect(texts()).toEqual([]);
    });
  });

  describe('kolizja z trwającym mostkiem', () => {
    it('rozmowa czeka na koniec mostka (także przeskoku czasu) i dopiero potem gra', () => {
      load();
      st().completeStage('stage_a');
      vi.advanceTimersByTime(2000); // MOSTEK A, potem przeskok czasu
      expect(st().timeJump).not.toBeNull();

      st().openApp('app_b'); // gracz otwiera aplikację w trakcie przeskoku
      expect(st().queuedOpenings).toEqual(['stage_b']);
      expect(st().isByteMasterTyping).toBe(false);
      vi.advanceTimersByTime(20000);
      expect(texts()).toEqual(['BYTE_MASTER:MOSTEK A']);

      st().endTimeJump();
      vi.advanceTimersByTime(2000); // PO PRZESKOKU
      expect(texts()).toEqual(['BYTE_MASTER:MOSTEK A', 'BYTE_MASTER:PO PRZESKOKU']);
      // mostek skończony, więc rozmowa przy otwarciu startuje
      expect(st().queuedOpenings).toEqual([]);
      expect(st().isByteMasterTyping).toBe(true);
      vi.advanceTimersByTime(4000);
      expect(texts()).toEqual([
        'BYTE_MASTER:MOSTEK A',
        'BYTE_MASTER:PO PRZESKOKU',
        'BYTE_MASTER:OPIS AUTA',
        'BYTE_MASTER:DRUGA KWESTIA'
      ]);
    });

    it('odblokowania mostka nie są opóźnione ani gubione przez rozmowę z kolejki', () => {
      load();
      useMissionStore.setState({ unlockedIcons: ['app_a', 'app_b'], highlightedTileId: null });
      st().completeStage('stage_a');
      vi.advanceTimersByTime(2000);
      st().openApp('app_b');
      st().endTimeJump();
      vi.advanceTimersByTime(2000);
      // 3 s od końca przeskoku (opóźnienie domyślne), niezależnie od rozmowy przy otwarciu
      vi.advanceTimersByTime(1000);
      expect(st().highlightedTileId).toBe('app_b');
      expect(st().unlockedIcons).toContain('app_b_unlocked');
    });

    it('dwie rozmowy w kolejce grają po kolei, po jednej', () => {
      const def = missionWith();
      def.stages!.push({
        id: 'stage_c',
        appId: 'app_c',
        openingConversation: [{ from: 'byte_master', text: 'C1' }],
        completion: {}
      });
      load(def);
      st().completeStage('stage_a');
      vi.advanceTimersByTime(2000);
      st().openApp('app_b');
      st().openApp('app_c');
      expect(st().queuedOpenings).toEqual(['stage_b', 'stage_c']);
      st().endTimeJump();
      vi.advanceTimersByTime(2000 + 4000 + 2000);
      expect(texts()).toEqual([
        'BYTE_MASTER:MOSTEK A',
        'BYTE_MASTER:PO PRZESKOKU',
        'BYTE_MASTER:OPIS AUTA',
        'BYTE_MASTER:DRUGA KWESTIA',
        'BYTE_MASTER:C1'
      ]);
    });

    it('etap zaliczony zanim rozmowa z kolejki zdążyła zagrać: rozmowa jest pomijana', () => {
      load();
      st().completeStage('stage_a');
      vi.advanceTimersByTime(2000);
      st().openApp('app_b');
      useMissionStore.setState({ completedStages: [...st().completedStages, 'stage_b'] });
      st().endTimeJump();
      vi.advanceTimersByTime(10000);
      expect(texts()).toEqual(['BYTE_MASTER:MOSTEK A', 'BYTE_MASTER:PO PRZESKOKU']);
    });

    it('zaliczenie etapu w trakcie rozmowy: jej reszta gra przed mostkiem etapu, bez gubienia i dublowania', () => {
      load();
      st().openApp('app_b');
      vi.advanceTimersByTime(2000); // OPIS AUTA zagrany, pisze druga kwestia
      st().completeStage('stage_b');
      vi.advanceTimersByTime(20000);
      expect(texts()).toEqual(['BYTE_MASTER:OPIS AUTA', 'BYTE_MASTER:DRUGA KWESTIA', 'BYTE_MASTER:MOSTEK B']);
      expect(st().pendingBridge).toBeNull();
    });
  });
});

describe('dwie kwestie gracza pod rząd w mostku (advanceBridge)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    __setBridgeDelayForTests(2000);
  });
  afterEach(() => vi.useRealTimers());

  it('po kliknięciu pierwszej od razu pojawia się druga; echa mają różne id i właściwą kolejność', () => {
    st().loadMission({
      ...mission2Definition,
      stages: [
        {
          id: 'stage_x',
          appId: 'app_x',
          completion: {
            conversation: [
              { from: 'byte_master', text: 'BM' },
              { from: 'player', id: 'p1', label: 'KWESTIA 1' },
              { from: 'player', id: 'p2', label: 'KWESTIA 2' },
              { from: 'byte_master', text: 'JUŻ CZAS' }
            ],
            highlightTile: 'app_y'
          }
        }
      ]
    } as MissionDefinition);
    useMissionStore.setState({ bootStage: 'desktop', chatMessages: [], highlightedTileId: null });
    st().completeStage('stage_x');
    vi.advanceTimersByTime(2000);
    expect(st().chatAvailableChoices.map((c) => c.id)).toEqual(['p1']);

    // Date.now() jest zamrożony przez fake timers, więc id nie mogą się powtórzyć
    st().chooseChatOption('p1');
    expect(st().chatAvailableChoices.map((c) => c.id)).toEqual(['p2']);
    expect(st().isByteMasterTyping).toBe(false);
    expect(st().highlightedTileId).toBeNull();
    st().chooseChatOption('p2');
    expect(st().chatAvailableChoices).toEqual([]);
    expect(st().isByteMasterTyping).toBe(true);
    vi.advanceTimersByTime(2000);

    expect(texts()).toEqual(['BYTE_MASTER:BM', 'PLAYER:KWESTIA 1', 'PLAYER:KWESTIA 2', 'BYTE_MASTER:JUŻ CZAS']);
    const ids = st().chatMessages.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(st().highlightedTileId).toBe('app_y');
  });
});
