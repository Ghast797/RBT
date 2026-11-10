import { describe, it, expect } from 'vitest';
import { victimChatConfig } from '../src/scenarios/mission_04_energy_rock/stages';
import { mapReportAnswer, resolvePreview } from '../src/scenarios/mission_04_energy_rock/minigames/VictimChatApp';

const nodes = victimChatConfig.dialogue.nodes;

describe('M4 negocjacje: konfiguracja', () => {
  it('D9 i D10 oceniane per węzeł, węzeł 3 bez oceny, bez trybu agregującego', () => {
    expect(victimChatConfig.dialogue.decisionNum).toBeUndefined();
    expect(nodes.find((n) => n.id === 'neg_1')!.decisionNum).toBe(9);
    expect(nodes.find((n) => n.id === 'neg_2')!.decisionNum).toBe(10);
    const n3 = nodes.find((n) => n.id === 'neg_3')!;
    expect(n3.decisionNum).toBeUndefined();
    expect(n3.options).toHaveLength(1);
    expect(n3.options[0].nextNode).toBeFalsy();
  });
});

describe('mapReportAnswer', () => {
  it('podmienia odpowiedź opcji z reportAnswers', () => {
    for (const [id, text] of Object.entries(victimChatConfig.reportAnswers)) {
      const node = nodes.find((n) => n.options.some((o) => o.id === id))!;
      const opt = node.options.find((o) => o.id === id)!;
      const out = mapReportAnswer(victimChatConfig, {
        num: node.decisionNum!,
        question: 'q',
        answer: opt.label,
        tier: opt.tier,
        feedback: opt.feedback
      });
      expect(out.answer).toBe(text);
      expect(out.tier).toBe(opt.tier);
    }
  });

  it('zostawia etykietę, gdy brak wpisu w reportAnswers', () => {
    const node = nodes.find((n) => n.decisionNum === 9)!;
    const opt = node.options.find((o) => !(o.id in victimChatConfig.reportAnswers))!;
    const d = { num: 9, question: 'q', answer: opt.label, tier: opt.tier, feedback: '' };
    expect(mapReportAnswer(victimChatConfig, d)).toEqual(d);
  });
});

describe('resolvePreview', () => {
  const p = victimChatConfig.preview;
  it('brak m4_note -> fallback', () => {
    const r = resolvePreview(p, undefined);
    expect(r.title).toBe(p.titles[p.fallback.titleId]);
    expect(r.time).toBe(p.times[p.fallback.timeId]);
    expect(r.color).toBe(p.colors[p.fallback.colorId]);
  });
  it('wybór gracza trafia do miniatury', () => {
    const titleId = Object.keys(p.titles)[1] ?? Object.keys(p.titles)[0];
    const timeId = Object.keys(p.times)[0];
    const colorId = Object.keys(p.colors)[Object.keys(p.colors).length - 1];
    const r = resolvePreview(p, { titleId, timeId, colorId });
    expect(r).toEqual({ title: p.titles[titleId], time: p.times[timeId], color: p.colors[colorId] });
  });
  it('nieznane id -> fallback', () => {
    const r = resolvePreview(p, { titleId: 'x', timeId: 'y', colorId: 'z' });
    expect(r.title).toBe(p.titles[p.fallback.titleId]);
  });
});
