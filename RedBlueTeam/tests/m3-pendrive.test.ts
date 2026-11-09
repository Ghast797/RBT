import { describe, it, expect } from 'vitest';
import { pendriveConfig as cfg } from '../src/scenarios/mission_03_ol_company/stages';
import {
  TIER_RANK,
  worseTier,
  aggregateD4,
  buildD4Report,
  buildVolumeCriticalReport,
  buildUsbState,
  fileMatchesPlan,
  resolvePlanRule
} from '../src/scenarios/mission_03_ol_company/minigames/usbLogic';
import { PLAN_STATE_KEY } from '../src/scenarios/mission_03_ol_company/minigames/types';

const vol = (id: string) => cfg.volume.options.find((o) => o.id === id)!;
const sig = (id: string) => cfg.signature.options.find((o) => o.id === id)!;

describe('M3 //DYSK E: logika pendrive', () => {
  it('worseTier wybiera gorszy poziom', () => {
    expect(worseTier('ideal', 'suboptimal')).toBe('suboptimal');
    expect(worseTier('critical', 'ideal')).toBe('critical');
    expect(worseTier('ideal', 'ideal')).toBe('ideal');
    expect(TIER_RANK.critical).toBeGreaterThan(TIER_RANK.suboptimal);
  });

  it('D4 = gorszy z nazwy i podpisu, odpowiedź to podpis', () => {
    const ideal = aggregateD4(vol('vol_impreza'), sig('env_afterparty'), cfg.reportLabels);
    expect(ideal.tier).toBe('ideal');
    expect(ideal.answer).toBe('ZDJĘCIA Z AFTERPARTY O&L COMPANY!');

    const nameWorse = aggregateD4(vol('vol_bo'), sig('env_afterparty'), cfg.reportLabels);
    expect(nameWorse.tier).toBe('suboptimal');
    expect(nameWorse.source).toBe('volume');
    expect(nameWorse.feedback).toBe(vol('vol_bo').feedback);
    // Ocenę obniżyła nazwa dysku: raport pokazuje obie odpowiedzi.
    expect(nameWorse.answer).toBe('NAZWA DYSKU: ZDJĘCIA B&O COMPANY / PODPIS: ZDJĘCIA Z AFTERPARTY O&L COMPANY!');

    const sigWorse = aggregateD4(vol('vol_impreza'), sig('env_bo'), cfg.reportLabels);
    expect(sigWorse.tier).toBe('suboptimal');
    expect(sigWorse.source).toBe('signature');
    // Ocenę wyznaczył podpis: w raporcie sam podpis (jak w debriefie).
    expect(sigWorse.answer).toBe('PENDRIVE ZE ZDJĘCIAMI B&O COMPANY');

    expect(aggregateD4(vol('vol_new_disk'), sig('env_lost_docs'), cfg.reportLabels).tier).toBe('critical');
    expect(aggregateD4(vol('vol_bo'), sig('env_bo'), cfg.reportLabels).tier).toBe('suboptimal');
  });

  it('buildD4Report: numer 4 i pytanie z podpisu', () => {
    const r = buildD4Report(cfg.signature, vol('vol_bo'), sig('env_afterparty'), cfg.reportLabels);
    expect(r.num).toBe(4);
    expect(r.question).toBe(cfg.signature.question);
    expect(r.tier).toBe('suboptimal');
    expect(r.answer).toBe('NAZWA DYSKU: ZDJĘCIA B&O COMPANY / PODPIS: ZDJĘCIA Z AFTERPARTY O&L COMPANY!');
    // Ścieżka idealna zgłasza sam podpis (zgodny z debriefem).
    expect(buildD4Report(cfg.signature, vol('vol_impreza'), sig('env_afterparty'), cfg.reportLabels).answer).toBe(
      'ZDJĘCIA Z AFTERPARTY O&L COMPANY!'
    );
  });

  it('KEYLOGGER zgłasza D4 critical od razu, inne nazwy nie', () => {
    const r = buildVolumeCriticalReport(cfg.signature, vol('vol_keylogger'));
    expect(r).not.toBeNull();
    expect(r!.tier).toBe('critical');
    expect(r!.num).toBe(4);
    expect(r!.answer).toBe('NAZWA DYSKU: KEYLOGGER');
    expect(buildVolumeCriticalReport(cfg.signature, vol('vol_impreza'))).toBeNull();
    expect(buildVolumeCriticalReport(cfg.signature, vol('vol_bo'))).toBeNull();
  });

  it('plik pasujący do planu D3', () => {
    const party = resolvePlanRule(cfg.plan, cfg.planFallbackVectorOptionId, 'vector_party_zip');
    expect(fileMatchesPlan(party, 'party_photos')).toBe(true);
    expect(fileMatchesPlan(party, 'hr_docs')).toBe(false);
    const hr = resolvePlanRule(cfg.plan, cfg.planFallbackVectorOptionId, 'vector_hr_docs');
    expect(fileMatchesPlan(hr, 'hr_docs')).toBe(true);
    expect(fileMatchesPlan(hr, 'termination')).toBe(true);
    expect(fileMatchesPlan(hr, 'party_photos')).toBe(false);
  });

  it('reguła wybierana po id opcji D3, nie po tekście odpowiedzi', () => {
    const hr = resolvePlanRule(cfg.plan, cfg.planFallbackVectorOptionId, 'vector_hr_docs');
    expect(hr?.vectorOptionId).toBe('vector_hr_docs');
    // Tekst odpowiedzi nie jest kluczem: to samo, co brak planu.
    const text = cfg.plan.find((r) => r.vectorOptionId === 'vector_hr_docs')!.planLabel;
    expect(resolvePlanRule(cfg.plan, cfg.planFallbackVectorOptionId, text)?.vectorOptionId).toBe(
      cfg.planFallbackVectorOptionId
    );
  });

  it('przypomnienie planu na ekranie przygotowania: przedrostek i opis planu dla każdej reguły', () => {
    expect(cfg.armTexts.planPrefix).toBe('PLAN:');
    cfg.plan
      .filter((r) => r.fileIds.length > 0)
      .forEach((r) => expect(r.planLabel.length, r.vectorOptionId).toBeGreaterThan(10));
    expect(cfg.plan.find((r) => r.vectorOptionId === 'vector_party_zip')!.planLabel).toBe('NAWIĄŻĘ DO IMPREZY DZIAŁU SPRZEDAŻY');
  });

  it('plan z D3 leży we wspólnym stanie pod kluczem m3_plan', () => {
    expect(PLAN_STATE_KEY).toBe('m3_plan');
  });

  it('brak D3 albo nieznane id = reguła zapasowa', () => {
    const fb = cfg.plan.find((r) => r.vectorOptionId === cfg.planFallbackVectorOptionId);
    expect(resolvePlanRule(cfg.plan, cfg.planFallbackVectorOptionId, undefined)).toBe(fb);
    expect(resolvePlanRule(cfg.plan, cfg.planFallbackVectorOptionId, 'coś innego')).toBe(fb);
    expect(fileMatchesPlan(undefined, 'party_photos')).toBe(false);
  });

  it('buildUsbState składa UsbState', () => {
    const att = cfg.attachments[0];
    expect(buildUsbState(vol('vol_impreza'), att, sig('env_afterparty'))).toEqual({
      volume: 'IMPREZA',
      archive: 'FOTKI_AFTERPARTY.ZIP',
      signature: 'ZDJĘCIA Z AFTERPARTY O&L COMPANY!'
    });
  });
});
