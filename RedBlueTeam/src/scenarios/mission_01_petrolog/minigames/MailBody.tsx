import React from 'react';

export interface MailBodyProps {
  /** Dopisek zależny od pliku z D2 (może być pusty). */
  mailText?: string;
  /** Podpis nadawcy (imię i nazwisko z D3). */
  senderName?: string;
  /** Link do strony-pułapki: każde miejsce rysuje go po swojemu (podgląd, podsumowanie, skrzynka ofiary). */
  link: React.ReactNode;
  /** Układ treści (odstępy, krój) zostaje po stronie miejsca użycia. */
  className?: string;
  /** Wygląd podpisu (każde miejsce ma własny). */
  signatureClassName?: string;
}

/**
 * Treść maila spear-phishingowego do Anity — jedno źródło dla podglądu na żywo, podsumowania
 * przed wysyłką i skrzynki ofiary, żeby gracz wszędzie widział ten sam list.
 */
export const MailBody: React.FC<MailBodyProps> = ({
  mailText,
  senderName,
  link,
  className = 'space-y-2',
  signatureClassName = 'text-gray-400 pt-2'
}) => (
  <div className={className} data-testid="mail-body">
    <p>Cześć Anita,</p>
    <p>Koniecznie musisz zobaczyć tę stronę:</p>
    {link}
    {mailText ? <p>{mailText}</p> : null}
    <p>Coś, czego szukałaś!</p>
    <p className={signatureClassName}>
      Pozdrawiam,
      <br />
      <strong className="text-white">{senderName || '[Nadawca]'}</strong>
    </p>
  </div>
);
