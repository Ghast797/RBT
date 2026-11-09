import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useMissionStore, __setBridgeDelayForTests } from '../src/engine/store/useMissionStore';
import { mission4Definition } from '../src/scenarios/mission_04_energy_rock';
import {
  decisionShare,
  pointsForTier,
  penaltyForTier,
  btcForScore,
  resolveDecisionCount
} from '../src/engine/core/scoring';
import {
  resolveVpnStep,
  vpnAfterSend,
  vpnConnectResult,
  vpnSenderReport,
  type VpnRouterConfig
} from '../src/engine/blocks/VpnRouter';
import { vpnConfig as m2VpnConfig } from '../src/scenarios/mission_02_carbon_flow/stages';

describe('Scoring (poziomy decyzji)', () => {
  it('dzieli maxScore równo na decyzje', () => {
    expect(decisionShare(100, 9)).toBeCloseTo(11.111, 2);
    expect(decisionShare(100, 4)).toBe(25);
  });

  it('punkty i kary zależą tylko od poziomu', () => {
    expect(pointsForTier('ideal', 100, 4)).toBe(25);
    expect(pointsForTier('suboptimal', 100, 4)).toBe(12.5);
    expect(pointsForTier('critical', 100, 4)).toBe(0);

    expect(penaltyForTier('ideal', 100, 4)).toBe(0);
    expect(penaltyForTier('suboptimal', 100, 4)).toBe(12.5);
    expect(penaltyForTier('critical', 100, 4)).toBe(25);
  });

  it('nagroda BTC skaluje się liniowo wynikiem', () => {
    expect(btcForScore(100, 3.79)).toBe(3.79);
    expect(btcForScore(0, 3.79)).toBe(0);
    expect(btcForScore(50, 4)).toBe(2);
  });

  it('liczy decyzje z definicji M4', () => {
    expect(resolveDecisionCount(mission4Definition)).toBe(10);
  });
});

describe('Mission 4: nowy model (etapy + klocki)', () => {
  beforeEach(() => {
    useMissionStore.getState().resetGame();
    useMissionStore.getState().loadMission('mission-4-energy-rock');
  });

  it('definicja ma etapy i dane klocków', () => {
    expect(mission4Definition.stages?.length).toBeGreaterThan(0);
    expect(mission4Definition.blocks).toBeDefined();
    const negotiationTile = mission4Definition.desktopApps.find((t) => t.id === 'negotiation');
    expect(negotiationTile?.componentId).toBe('er_victim_chat');
  });

  it('reportDecision zapisuje decyzję i nie karze wyboru idealnego', () => {
    const store = useMissionStore.getState();
    const scoreBefore = useMissionStore.getState().score;

    store.reportDecision({
      num: 10,
      question: 'Negocjacje z ofiarą:',
      answer: 'MACIE 3 H...',
      tier: 'ideal',
      feedback: 'Twardy limit czasu.'
    });

    const state = useMissionStore.getState();
    expect(state.score).toBe(scoreBefore);
    const choice = state.playerChoices.find((c) => c.num === 10);
    expect(choice?.outcome).toBe('ideal');
  });

  it('błąd krytyczny obniża wynik i otwiera ekran wykrycia', () => {
    const store = useMissionStore.getState();
    store.reportDecision({
      num: 10,
      question: 'Negocjacje z ofiarą:',
      answer: 'OKEJ, JUŻ WAM NIE PRZESZKADZAM',
      tier: 'critical',
      feedback: 'Kapitulacja.'
    });

    const state = useMissionStore.getState();
    expect(state.isDetectedModalOpen).toBe(true);
    expect(state.criticalErrorsCount).toBe(1);
    expect(state.score).toBeLessThan(100);
  });

  it('completeStage(negotiation) odblokowuje raport końcowy po rozmowie meldunkowej', () => {
    vi.useFakeTimers();
    __setBridgeDelayForTests(0);
    try {
      const store = useMissionStore.getState();
      store.completeStage('negotiation');
      // Odblokowanie następuje dopiero po przegraniu rozmowy mostkującej (meldunek).
      for (let i = 0; i < 40; i++) {
        vi.runAllTimers();
        const st = useMissionStore.getState();
        if (!st.pendingBridge) break;
        const beat = st.chatAvailableChoices.find((c) => c.bridgeBeat);
        if (beat) useMissionStore.getState().chooseChatOption(beat.id);
        else break;
      }
      const state = useMissionStore.getState();
      expect(state.unlockedIcons).toContain('debrief_app');
      expect(state.unlockedIcons).toContain('mission_completed');
    } finally {
      vi.useRealTimers();
      __setBridgeDelayForTests(2000);
    }
  });
});

describe('VpnRouter: bramka IP + jedna decyzja nadawcy (kontrakt 10.1 pkt 5)', () => {
  const config: VpnRouterConfig = {
    vpn: { initialIp: '106.55.202.120', targetIp: '109.43.200.124' },
    sender: {
      decisionNum: 7,
      question: 'WYBIERZ ADRES, Z KTÓREGO WYŚLESZ MAILA:',
      confirmLabel: 'WYŚLIJ MAILA',
      includeIpInAnswer: true,
      options: [
        { id: 'wilk', label: 'M.WILK@PRIV.COM', tier: 'ideal', feedback: 'ok' },
        { id: 'alex', label: 'ALEX@PRIV.COM', tier: 'suboptimal', feedback: 'meh' },
        { id: 'spam', label: 'NEWRAWGOODS@COMMERCIAL.BIZ', tier: 'critical', feedback: 'źle' }
      ]
    }
  };

  it('krok IP bez decisionNum: zły adres blokuje bez raportu (bez kary), dobry przepuszcza bez oceny', () => {
    expect(resolveVpnStep(config).decisionNum).toBeUndefined();
    expect(vpnConnectResult(config, '106.55.202.120')).toEqual({ ok: false, report: null });
    expect(vpnConnectResult(config, '109.43.200.124')).toEqual({ ok: true, report: null });
  });

  it('nadawca to jedyna decyzja; odpowiedź = IP + nadawca, poziom i feedback z opcji', () => {
    const reports = [vpnConnectResult(config, '1.2.3.4').report, vpnConnectResult(config, '109.43.200.124').report]
      .filter(Boolean);
    expect(reports).toHaveLength(0);
    const r = vpnSenderReport(config.sender!, config.sender!.options[0], '109.43.200.124');
    expect(r).toEqual({
      num: 7,
      question: 'WYBIERZ ADRES, Z KTÓREGO WYŚLESZ MAILA:',
      answer: '109.43.200.124 + M.WILK@PRIV.COM',
      tier: 'ideal',
      feedback: 'ok'
    });
    expect(vpnSenderReport(config.sender!, config.sender!.options[1], '109.43.200.124').tier).toBe('suboptimal');
  });

  it('bez includeIpInAnswer odpowiedź to sam nadawca (reportAnswer ?? label)', () => {
    const sender = { ...config.sender!, includeIpInAnswer: undefined };
    expect(vpnSenderReport(sender, sender.options[1], '109.43.200.124').answer).toBe('ALEX@PRIV.COM');
    expect(vpnSenderReport(sender, { ...sender.options[1], reportAnswer: 'ALEX' }, 'x').answer).toBe('ALEX');
  });

  it('przeskok czasu po wysyłce tylko, gdy config.timeJump podany', () => {
    expect(vpnAfterSend(config)).toBe('complete');
    expect(vpnAfterSend({ ...config, timeJump: { label: 'KILKA GODZIN PÓŹNIEJ' } })).toBe('timejump');
  });

  it('krok IP z decisionNum nadal ocenia adres (zgodność wsteczna)', () => {
    const graded: VpnRouterConfig = { ...config, vpn: { ...config.vpn!, decisionNum: 6, question: 'IP:' } };
    expect(vpnConnectResult(graded, '109.43.200.124').report?.tier).toBe('ideal');
    expect(vpnConnectResult(graded, '1.2.3.4')).toMatchObject({ ok: false, report: { num: 6, tier: 'critical' } });
  });

  it('M2 (płaski config, bez nadawcy): biała lista przepuszcza każdy adres z listy, bez raportu', () => {
    const cfg = m2VpnConfig as VpnRouterConfig;
    for (const ip of cfg.allowedIps ?? []) expect(vpnConnectResult(cfg, ip)).toEqual({ ok: true, report: null });
    expect(vpnConnectResult(cfg, cfg.initialIp!).ok).toBe(false);
  });
});
