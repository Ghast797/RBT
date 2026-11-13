import React from 'react';
import { MessageSquareWarning } from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import type { RejectedAttempt } from '../types/mission';

const NONE: RejectedAttempt[] = [];

/** Próby decyzji `num` odrzucone przez mentora (B2) — stan w store, więc przeżywa zamknięcie aplikacji. */
export function useRejectedAttempts(num: number | undefined): RejectedAttempt[] {
  return useMissionStore((s) => (num === undefined ? NONE : s.rejectedAttempts[num] ?? NONE));
}

/**
 * Zawęża próby do opcji z podanej listy (po `id`). Gdy jedna decyzja ma kilka ekranów wyboru (np. nazwa dysku
 * i podpis), kwestia mentora z jednego ekranu nie pojawia się na drugim.
 */
export const scopeAttempts = (attempts: RejectedAttempt[], optionIds: readonly string[]): RejectedAttempt[] =>
  attempts.filter((a) => optionIds.includes(a.optionId));

/** Próby decyzji `num` odrzucone przez mentora, tylko wśród podanych opcji. */
export function useRejectedAmong(num: number | undefined, options: readonly { id: string }[]): RejectedAttempt[] {
  const all = useRejectedAttempts(num);
  return scopeAttempts(all, options.map((o) => o.id));
}

/** Czy opcja (po `id`, nie po etykiecie — `reportAnswer` może się różnić) została już odrzucona przez mentora. */
export const isRejected = (attempts: RejectedAttempt[], optionId: string): boolean =>
  attempts.some((a) => a.optionId === optionId);

/**
 * Komunikat przy opcjach: ostatnia kwestia BYTE_MASTERA po odrzuceniu wyboru (B2).
 * Ta sama kwestia trafia do historii czatu z mentorem.
 */
export const MentorRejectNotice: React.FC<{ attempts: RejectedAttempt[] }> = ({ attempts }) => {
  const last = attempts[attempts.length - 1];
  if (!last) return null;
  return (
    <div
      role="alert"
      data-mentor-reject="true"
      className="mb-3 flex items-start gap-2 rounded-lg border border-[#ff3366]/60 bg-[#1f060b] px-3 py-2.5 text-xs text-red-100 leading-relaxed"
    >
      <MessageSquareWarning size={16} className="mt-0.5 shrink-0 text-[#ff3366]" />
      <div>
        <div className="text-[0.625rem] font-black uppercase tracking-widest text-[#ff3366] mb-0.5">
          BYTE_MASTER: ODRZUCONE — WYBIERZ PONOWNIE
        </div>
        <span className="font-sans">{last.mentorLine}</span>
      </div>
    </div>
  );
};
