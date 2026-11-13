import { describe, it, expect } from 'vitest';
import {
  builderConfig,
  c2Config,
  mailConfig,
  victimChatConfig,
  virusLabConfig,
  vpnConfig
} from '../src/scenarios/mission_04_energy_rock/stages';
import {
  buildNoteRejection,
  buildPasswordRejection,
  buildPasswordReport,
  evaluatePassword
} from '../src/scenarios/mission_04_energy_rock/minigames/ransomLogic';
import { buildExfilReport } from '../src/scenarios/mission_04_energy_rock/minigames/exfilLogic';

const nodes = victimChatConfig.dialogue.nodes;
const node = (id: string) => nodes.find((n) => n.id === id)!;
const opt = (nodeId: string, id: string) => node(nodeId).options.find((o) => o.id === id)!;
const four = ['pw_upper', 'pw_lower', 'pw_digits', 'pw_special'];

describe('M4: odrzucenie przez mentora (B2) zamiast critical', () => {
  it('D1: RAT i keylogger, D5-D7: złe opcje = suboptimal + mentorLine, ideal bez reject', () => {
    const groups = [
      virusLabConfig.virus.options.filter((o) => o.id !== 'ransomware'),
      mailConfig.subject.options.filter((o) => o.id === 'subj_analyst'),
      mailConfig.body.options.filter((o) => o.id === 'body_no_pwd'),
      vpnConfig.sender!.options.filter((o) => o.id === 'sender_spam')
    ];
    for (const g of groups) {
      expect(g.length).toBeGreaterThan(0);
      for (const o of g) {
        expect(o.tier, o.id).toBe('suboptimal');
        expect(o.reject?.mentorLine, o.id).toBeTruthy();
        expect(o.reject!.mentorLine).toBe(o.reject!.mentorLine.toUpperCase());
      }
    }
    const best = [
      ...virusLabConfig.virus.options.filter((o) => o.id === 'ransomware'),
      ...mailConfig.subject.options.filter((o) => o.tier === 'ideal'),
      ...mailConfig.body.options.filter((o) => o.tier === 'ideal'),
      ...vpnConfig.sender!.options.filter((o) => o.tier === 'ideal')
    ];
    for (const o of best) expect(o.reject).toBeUndefined();
  });

  it('D3: kafelek 30 s odrzuca mentor, pozostałe kafelki nie', () => {
    const tiles = builderConfig.note.tiles;
    expect(tiles.find((t) => t.id === 'time_30s')!.tier).toBe('suboptimal');
    expect(tiles.filter((t) => t.reject).map((t) => t.id)).toEqual(['time_30s']);
    const r = buildNoteRejection(builderConfig.note, { title: 'title_encrypted', time: 'time_30s' })!;
    expect(r.slot).toBe('time');
    expect(r.rejection).toMatchObject({ num: 3, optionId: 'time_30s', tier: 'suboptimal' });
    expect(r.rejection.mentorLine).toMatch(/WYBIERZ INACZEJ/);
    expect(buildNoteRejection(builderConfig.note, { title: 'title_casual', time: 'time_30h' })).toBeNull();
  });

  it('D2: rejectLine odrzuca 8 znaków i znaki zakazane, nie rusza silnego ani średniego hasła', () => {
    const p = builderConfig.password;
    expect(p.rejectLine).toBeTypeOf('function');
    const short = buildPasswordRejection(p, evaluatePassword(p, four, 8), four)!;
    expect(short.mentorLine).toMatch(/INACZEJ/);
    expect(short).toMatchObject({ num: 2, tier: 'critical' });
    const withSpace = [...four, 'pw_space'];
    const forbidden = buildPasswordRejection(p, evaluatePassword(p, withSpace, 24), withSpace)!;
    expect(forbidden.mentorLine).toMatch(/SPACJE I ZNAKI NARODOWE/);
    expect(forbidden.mentorLine).not.toBe(short.mentorLine);
    expect(buildPasswordRejection(p, evaluatePassword(p, ['pw_national'], 12), ['pw_national'])).not.toBeNull();
    expect(buildPasswordRejection(p, evaluatePassword(p, four, 12), four)).toBeNull();
    expect(buildPasswordRejection(p, evaluatePassword(p, four, 24), four)).toBeNull();
    expect(short.optionId).not.toBe(forbidden.optionId);
    expect(buildPasswordReport(p, evaluatePassword(p, four, 24)).tier).toBe('ideal');
  });

  it('D8: same fałszywe pliki = critical z failTitle „OPERACJA NIEUDANA” i failText w raporcie', () => {
    const ids = c2Config.exfil.files.filter((f) => f.role === 'other').slice(0, 2).map((f) => f.id);
    const r = buildExfilReport(c2Config.exfil, ids);
    expect(r.tier).toBe('critical');
    expect(r.failTitle).toBe('OPERACJA NIEUDANA');
    expect(r.failText).toBe(c2Config.exfil.failText);
    const target = c2Config.exfil.files.find((f) => f.role === 'target')!.id;
    const ok = buildExfilReport(c2Config.exfil, [target]);
    expect(ok.failTitle).toBeUndefined();
    expect(ok.failText).toBeUndefined();
  });
});

describe('M4: negocjacje po zmianach (D9, D10)', () => {
  it('D9: kapitulacja i agresja = suboptimal, bez reject, z osobnymi gałęziami', () => {
    expect(opt('neg_1', 'surrender').tier).toBe('suboptimal');
    expect(opt('neg_1', 'surrender').reject).toBeUndefined();
    expect(opt('neg_1', 'surrender').nextNode).toBe('neg_1_retreat');
    expect(opt('neg_1', 'aggression').tier).toBe('suboptimal');
    expect(opt('neg_1', 'aggression').nextNode).toBe('neg_1_threat');
    expect(opt('neg_1', 'firm_stance').nextNode).toBe('neg_2');
  });

  it('nowe węzły (retreat, threat) są bez oceny, mają jedną odpowiedź i wracają do D10', () => {
    for (const id of ['neg_1_retreat', 'neg_1_threat']) {
      const n = node(id);
      expect(n, id).toBeDefined();
      expect(n.decisionNum).toBeUndefined();
      expect(n.incoming.length).toBeGreaterThan(10);
      expect(n.options).toHaveLength(1);
      expect(n.options[0].nextNode).toBe('neg_2');
    }
    expect(node('neg_1_threat').incoming).toMatch(/ZRYWAM/);
  });

  it('wszystkie nextNode wskazują istniejący węzeł', () => {
    const ids = new Set(nodes.map((n) => n.id));
    for (const n of nodes) for (const o of n.options) if (o.nextNode) expect(ids.has(o.nextNode), o.id).toBe(true);
  });

  it('D10: „dla zabawy” i „dostęp do Freevolt” to critical z własnym failTitle/failText', () => {
    const troll = opt('neg_2', 'troll');
    expect(troll.tier).toBe('critical');
    expect(troll.failTitle).toBe('OKUP PRZEPADŁ');
    expect(troll.failText).toBeTruthy();
    expect(troll.failTitle).not.toMatch(/WYKRYT/);
    const reveal = opt('neg_2', 'reveal_motive');
    expect(reveal.tier).toBe('critical');
    expect(reveal.failTitle).toBe('DEKONSPIRACJA');
    expect(reveal.failText).toBeTruthy();
    expect(opt('neg_2', 'btc_demand').tier).toBe('ideal');
  });
});
