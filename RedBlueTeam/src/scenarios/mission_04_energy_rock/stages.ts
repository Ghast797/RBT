// Etapy i dane klocków Misji 4, które przeszły na nowy model silnika.
// Treść (teksty, poziomy, feedback) mieszka tutaj, nie w kodzie widgetu.
// Zob. docs/scenario-engine.md, sekcje 5–6.

import type { StageDefinition, DialogueTreeConfig } from '../../engine/types/mission';

/** Decyzja 9: negocjacje z Szefem IT (klocek DialogueTree, tryb agregujący). */
export const negotiationBlock: DialogueTreeConfig = {
  respondent: 'SZEF IT ENERGY ROCK',
  decisionNum: 9,
  question: 'Negocjacje z ofiarą:',
  closingMessage: 'ROZUMIEM... PRZYGOTOWUJEMY BITCOINY. TYLKO NIE NISZCZCIE NASZYCH BAZ.',
  nodes: [
    {
      id: 'neg_1',
      incoming: 'ROZWIĄZUJEMY PROBLEM RANSOMWARE! ODPOWIEDNIE SŁUŻBY ZOSTAŁY JUŻ POWIADOMIONE',
      options: [
        {
          id: 'aggression',
          label: 'NIE BOJĘ SIĘ POLICJI',
          tier: 'suboptimal',
          feedback: 'Pusta agresja bez argumentów technicznych.',
          nextNode: 'neg_2'
        },
        {
          id: 'surrender',
          label: 'OKEJ, JUŻ WAM NIE PRZESZKADZAM',
          tier: 'critical',
          feedback: 'Kapitulacja i natychmiastowa rezygnacja z pozycji negocjacyjnej.'
        },
        {
          id: 'firm_stance',
          label: 'ODPOWIEDNIE SŁUŻBY NIE ODSZYFRUJĄ WASZYCH PLIKÓW. ZASTANÓW SIĘ DOBRZE, CO CHCESZ ZROBIĆ',
          tier: 'ideal',
          feedback: 'Rzeczowy argument techniczny paraliżujący decyzyjność ofiary.',
          nextNode: 'neg_2'
        }
      ]
    },
    {
      id: 'neg_2',
      incoming: 'CZEGO CHCESZ W ZAMIAN ZA ODSZYFROWANIE DANYCH?',
      options: [
        {
          id: 'troll',
          label: 'NICZEGO NIE ODSZYFRUJĘ, ROBIĘ TO DLA ZABAWY :D',
          tier: 'suboptimal',
          feedback: 'Utrata wiarygodności profesjonalnego żądania.',
          nextNode: 'neg_3'
        },
        {
          id: 'reveal_motive',
          label: 'CHCĘ DOSTĘPU DO PLIKÓW FREEVOLT',
          tier: 'critical',
          feedback: 'Zdemaskowanie prawdziwego celu operacji zamiast przykrywki finansowej.'
        },
        {
          id: 'btc_demand',
          label: 'TAK, JAK NAPISAŁEM W WIADOMOŚCI - INTERESUJĄ MNIE TYLKO BITCOINY',
          tier: 'ideal',
          feedback: 'Podtrzymanie wiarygodnej przykrywki finansowej.',
          nextNode: 'neg_3'
        }
      ]
    },
    {
      id: 'neg_3',
      incoming: 'POTRZEBUJEMY CZASU NA ICH ZDOBYCIE',
      options: [
        {
          id: 'give_days',
          label: 'DOBRZE, DAM WAM KILKA DNI',
          tier: 'critical',
          feedback: 'Zbyt długi czas pozwala ofierze odzyskać dane z kopii zapasowych.'
        },
        {
          id: 'deadline_3h',
          label: 'MACIE 3 H. POTEM NIE DOSTANIECIE JUŻ KLUCZA',
          tier: 'ideal',
          feedback: 'Twardy limit czasu uniemożliwia ofierze procedury przywracania danych.'
        }
      ]
    }
  ]
};

/** Dane klocków M4, kluczowane identyfikatorem kafelka pulpitu. */
export const mission4Blocks: Record<string, unknown> = {
  negotiation: negotiationBlock
};

/** Etapy M4 przepięte na nowy przebieg (completeStage). */
export const mission4Stages: StageDefinition[] = [
  {
    id: 'negotiation',
    appId: 'negotiation',
    decisions: [9],
    completion: {
      unlockIcons: ['mission_completed', 'debrief_app'],
      badges: { debrief_app: 1, chat: 1 },
      sound: 'success',
      byteMasterMessage:
        'PERFEKCYJNA ROBOTA! Cel osiągnięty – dokumentacja Freevolt jest zabezpieczona, a Energy Rock kupiło naszą przykrywkę. Otwórz raport końcowy, aby zamknąć operację i przesłać wynik do SCORM.',
      nextChoice: {
        id: 'm4_open_debrief',
        label: 'OTWIERAM PODSUMOWANIE MISJI',
        openAppId: 'debrief_app'
      }
    }
  }
];
