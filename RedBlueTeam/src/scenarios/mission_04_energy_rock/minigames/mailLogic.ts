// Czysta logika //MAIL (M4, etap 3): stan pól wiadomości i kompletność kroków. Bez UI i bez oceniania
// (poziomy i punkty pochodzą z configu i silnika).

import type { M4MailState, ReportableOption } from './types';

export type MailStep = 'subject' | 'body' | 'arm';

/** Wybrany kafelek (po id) albo `undefined`, gdy id puste lub nieznane. */
export function findOption<O extends ReportableOption>(options: readonly O[], id: string | null): O | undefined {
  return id ? options.find((o) => o.id === id) : undefined;
}

/** Pole przyjmuje jeden kafelek naraz: nowy wybór zastępuje poprzedni; nieznane id zostawia stan bez zmian. */
export function placeInField(current: string | null, incomingId: string, options: readonly ReportableOption[]): string | null {
  return options.some((o) => o.id === incomingId) ? incomingId : current;
}

/** Krok można zatwierdzić dopiero po wypełnieniu jego pola. */
export function canConfirmStep(step: MailStep, subjectId: string | null, bodyId: string | null): boolean {
  if (step === 'subject') return !!subjectId;
  if (step === 'body') return !!bodyId;
  return false;
}

/** Wiadomość gotowa do uzbrojenia: oba pola wypełnione. */
export function isMailComplete(subjectId: string | null, bodyId: string | null): boolean {
  return !!subjectId && !!bodyId;
}

/** Wartość do `customState[M4_MAIL_KEY]`; `null`, gdy wiadomość niekompletna. */
export function buildMailState(subjectId: string | null, bodyId: string | null): M4MailState | null {
  return subjectId && bodyId ? { subjectId, bodyId } : null;
}
