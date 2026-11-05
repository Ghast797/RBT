// Pełne okno w odtwarzaczu SCORM Moodle (tryb „Nowe okno”).
//
// Odtwarzacz Moodle (mod/scorm/player.php) otacza paczkę własną stroną: pasek spisu treści
// z przyciskiem „>”, białe tło i marginesy. Paczka jest serwowana z tej samej domeny co Moodle,
// więc gra może rozciągnąć swój iframe na całe okno i przyciemnić tło strony odtwarzacza.
// W trybie osadzonym (bieżące okno) nic nie zmieniamy — nie zasłaniamy nawigacji Moodle.

const BACKGROUND = '#070b0e';
const FRAME_ATTR = 'data-hackers-os-frame';
const STYLE_ID = 'hackers-os-fullwindow';

// Arkusz z !important, a nie style inline: Moodle przy każdej zmianie rozmiaru okna przypisuje
// iframe'owi wysokość od nowa (`style.height = …`), co kasuje priorytet stylu inline.
// Reguła !important z arkusza wygrywa z każdym zwykłym stylem inline.
const CSS = `
html, body {
  background: ${BACKGROUND} !important;
  overflow: hidden !important;
  margin: 0 !important;
  padding: 0 !important;
}
[${FRAME_ATTR}] {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  margin: 0 !important;
  border: 0 !important;
  z-index: 2147483000 !important;
  background: ${BACKGROUND} !important;
}
`;

/** Czy okno-rodzic to odtwarzacz SCORM otwarty jako osobne okno (popup). */
function isPopupPlayer(player: Window): boolean {
  const search = player.location?.search || '';
  return /[?&]display=popup\b/.test(search) || !!player.opener;
}

/**
 * Rozciąga iframe gry na całe okno odtwarzacza Moodle w trybie popup.
 * Zwraca `true`, gdy dopasowanie zostało zastosowane.
 */
export function fillLmsPopupWindow(win: Window = window): boolean {
  try {
    const frame = win.frameElement;
    if (!frame || win.parent === win) return false;
    const player = win.parent;
    if (!isPopupPlayer(player)) return false;

    const doc = player.document;
    frame.setAttribute(FRAME_ATTR, '');
    if (!doc.getElementById(STYLE_ID)) {
      const style = doc.createElement('style');
      style.id = STYLE_ID;
      style.textContent = CSS;
      (doc.head || doc.documentElement).appendChild(style);
    }
    return true;
  } catch {
    // Paczka z innej domeny niż Moodle — brak dostępu do strony odtwarzacza.
    return false;
  }
}
