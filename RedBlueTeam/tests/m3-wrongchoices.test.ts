import { describe, it, expect } from 'vitest';
import {
  virusLabConfig,
  osintBrowserConfig,
  pendriveConfig as cfg,
  droneConfig
} from '../src/scenarios/mission_03_ol_company/stages';
import { aggregateD4, buildD4Report, resolveOptionsForPlan } from '../src/scenarios/mission_03_ol_company/minigames/usbLogic';
import { submitDecision } from '../src/engine/core/report';

const PARTY = 'vector_party_zip';
const HR = 'vector_hr_docs';

describe('M3: złe wybory wg D-06 (B2 / critical / suboptimal)', () => {
  it('D1: ransomware to critical (wykrycie), keylogger to B2', () => {
    const byId = Object.fromEntries(virusLabConfig.virus.options.map((o) => [o.id, o]));
    expect(byId.ransomware.tier).toBe('critical');
    expect(byId.ransomware.reject).toBeUndefined();
    expect(byId.keylogger.tier).toBe('suboptimal');
    expect(byId.keylogger.reject?.mentorLine.length).toBeGreaterThan(10);
  });

  it('D2: Wiktoria i Agnieszka to B2, szef cyberbezpieczeństwa i CEO critical bez odrzucenia', () => {
    const byId = Object.fromEntries(osintBrowserConfig.target.options.map((o) => [o.id, o]));
    for (const id of ['choose_logistics', 'choose_sales']) {
      expect(byId[id].reject?.mentorLine, id).toBeTruthy();
      expect(byId[id].tier).toBe('suboptimal');
    }
    for (const id of ['choose_ciso', 'choose_ceo']) {
      expect(byId[id].tier).toBe('critical');
      expect(byId[id].reject).toBeUndefined();
    }
    const ids: string[] = [];
    const handlers = { onDecision: () => ids.push('decision'), rejectDecision: () => ids.push('reject') };
    expect(submitDecision(osintBrowserConfig.target, byId.choose_logistics, handlers)).toBe('rejected');
    expect(ids).toEqual(['reject']);
  });

  it('D3: pusty pendrive z keyloggerem zostaje critical', () => {
    const o = osintBrowserConfig.vector.options.find((x) => x.id === 'vector_empty_keylogger')!;
    expect(o.tier).toBe('critical');
    expect(o.reject).toBeUndefined();
  });

  it('D5: trzy złe adresy to critical z failTitle i failText, bez zdradzania poprawnego', () => {
    for (const o of droneConfig.address.options.filter((x) => x.tier === 'critical')) {
      expect(o.failTitle, o.id).toBeTruthy();
      expect(o.failText, o.id).toContain(o.label);
      expect(o.failText).not.toMatch(/OŁTASZYŃSKA/);
    }
    expect(droneConfig.address.options.filter((x) => x.tier === 'critical')).toHaveLength(3);
    expect(droneConfig.address.options.find((x) => x.id === 'loc_4')!.tier).toBe('ideal');
  });

  it('D6: siedem złych aut to critical z failTitle/failText, pusty asfalt to suboptimal', () => {
    const wrong = droneConfig.car.options.filter((o) => o.tier === 'critical');
    expect(wrong).toHaveLength(7);
    wrong.forEach((o) => {
      expect(o.failTitle).toBeTruthy();
      expect(o.failText).toContain(o.label.toLowerCase());
      expect(o.failText).not.toMatch(/CZERWONYM DACHEM/i);
    });
    const asphalt = droneConfig.car.options.find((o) => o.id === droneConfig.asphalt.id)!;
    expect(asphalt.tier).toBe('suboptimal');
    expect(asphalt.failTitle).toBeUndefined();
    expect(asphalt.reject).toBeUndefined();
  });
});

describe('M3 D4: poziomy zależne od planu z D3 (M3-06)', () => {
  const vols = (plan: string) => Object.fromEntries(resolveOptionsForPlan(cfg.volume.options, plan).map((o) => [o.label, o]));
  const sigs = (plan: string) => Object.fromEntries(resolveOptionsForPlan(cfg.signature.options, plan).map((o) => [o.id, o]));

  it('plan zdjęć: poziomy jak dotąd', () => {
    const s = sigs(PARTY);
    expect([s.env_afterparty.tier, s.env_bo.tier, s.env_lost_docs.tier, s.env_termination.tier]).toEqual([
      'ideal',
      'suboptimal',
      'critical',
      'critical'
    ]);
    const v = vols(PARTY);
    expect(Object.keys(v).sort()).toEqual(['IMPREZA', 'KEYLOGGER', 'NOWY DYSK', 'ZDJĘCIA B&O COMPANY']);
    expect(v['IMPREZA'].tier).toBe('ideal');
  });

  it('plan HR: pasujący podpis i nazwa ideal, niepasujące critical, ogólne suboptimal', () => {
    const s = sigs(HR);
    expect(s.env_termination.tier).toBe('ideal');
    expect(s.env_lost_docs.tier).toBe('suboptimal');
    expect(s.env_afterparty.tier).toBe('critical');
    expect(s.env_bo.tier).toBe('critical');
    expect(s.env_afterparty.feedback).toMatch(/dokumenty HR/);
    const v = vols(HR);
    expect(Object.keys(v).sort()).toEqual(['DOKUMENTY B&O COMPANY', 'DOKUMENTY HR', 'KEYLOGGER', 'NOWY DYSK']);
    expect(v['DOKUMENTY HR'].tier).toBe('ideal');
    expect(v['DOKUMENTY B&O COMPANY'].tier).toBe('suboptimal');
  });

  it('każdy plan ma dokładnie jedną idealną nazwę i jeden idealny podpis', () => {
    for (const plan of [PARTY, HR]) {
      expect(Object.values(vols(plan)).filter((o) => o.tier === 'ideal')).toHaveLength(1);
      expect(Object.values(sigs(plan)).filter((o) => o.tier === 'ideal')).toHaveLength(1);
    }
  });

  it('KEYLOGGER jako nazwa dysku to critical przy każdym planie, z informacją o zgłoszeniu', () => {
    for (const plan of [PARTY, HR]) {
      const k = vols(plan)['KEYLOGGER'];
      expect(k.tier).toBe('critical');
      expect(k.feedback).toMatch(/zgłoszą/);
    }
  });

  it('raport D4 przy planie HR: WYPOWIEDZENIE UMOWY + DOKUMENTY HR = ideal; ZDJĘCIA Z AFTERPARTY = critical', () => {
    const v = vols(HR);
    const s = sigs(HR);
    expect(buildD4Report(cfg.signature, v['DOKUMENTY HR'], s.env_termination, cfg.reportLabels).tier).toBe('ideal');
    const bad = aggregateD4(v['DOKUMENTY HR'], s.env_afterparty, cfg.reportLabels);
    expect(bad.tier).toBe('critical');
    expect(bad.feedback).toMatch(/oddaje kopertę do ochrony/);
  });

  it('plan nieznany lub brak planu: opcje bez zmian dla planu bez forPlans/byPlan, nazwy specyficzne ukryte', () => {
    const none = resolveOptionsForPlan(cfg.volume.options, undefined);
    expect(none.map((o) => o.id).sort()).toEqual(['vol_keylogger', 'vol_new_disk']);
  });
});
