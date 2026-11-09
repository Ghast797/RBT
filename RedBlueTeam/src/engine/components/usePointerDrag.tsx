import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  DEFAULT_DRAG_THRESHOLD,
  moveDrag,
  pressDrag,
  releaseDrag,
  type DropZoneRect,
  type PointerDragState
} from '../core/pointerDrag';

export interface PointerDropEvent<T extends string = string> {
  itemId: T;
  zoneId: string;
  /** Pozycja kursora w momencie upuszczenia (współrzędne okna). */
  x: number;
  y: number;
}

export interface UsePointerDragOptions<T extends string = string> {
  /** Element upuszczono w strefie, która go przyjmuje. */
  onDrop: (event: PointerDropEvent<T>) => void;
  /**
   * Zwykłe stuknięcie/klik (wskaźnik prawie się nie ruszył). Użyj tego zamiast `onClick`
   * na przeciąganym elemencie: klik to alternatywa dla przeciągnięcia, więc zwykle woła
   * to samo co `onDrop` (np. „wstaw do jedynej strefy”).
   */
  onTap?: (itemId: T) => void;
  /** Puszczono po przeciąganiu poza strefą przyjmującą element (albo wciśnięto Esc). */
  onCancel?: (itemId: T) => void;
  /** Czy element można teraz przeciągać (np. jeszcze nie wstawiony). Domyślnie tak. */
  canDrag?: (itemId: T) => boolean;
  /** Czy strefa przyjmuje element. Strefy odrzucające nie podświetlają się. Domyślnie wszystkie przyjmują. */
  accepts?: (itemId: T, zoneId: string) => boolean;
  /** Próg ruchu w px, od którego zaczyna się przeciąganie (domyślnie 5). */
  threshold?: number;
}

export interface PointerDragApi<T extends string = string> {
  /** Trwające przeciąganie (po przekroczeniu progu): id elementu, pozycja kursora i strefa pod nim. */
  dragging: { itemId: T; x: number; y: number; overZone: string | null } | null;
  /** Id elementu, który jest teraz przeciągany (do przyciemnienia źródła), albo `null`. */
  draggedId: T | null;
  /** Rozwiń na przeciąganym elemencie: `<div {...drag.getDragProps(id)} />`. */
  getDragProps: (itemId: T) => {
    onPointerDown: (e: React.PointerEvent) => void;
    onDragStart: (e: React.DragEvent) => void;
    style: React.CSSProperties;
  };
  /** Ref strefy upuszczania: `<div ref={drag.zoneRef('pendrive')} />`. Id jest dowolnym tekstem. */
  zoneRef: (zoneId: string) => (el: HTMLElement | null) => void;
  /** Trwa przeciąganie elementu, który ta strefa przyjmuje (podświetl obrys strefy). */
  isDropTarget: (zoneId: string) => boolean;
  /** Kursor z przeciąganym elementem jest nad tą strefą (podświetl mocniej). */
  isOver: (zoneId: string) => boolean;
}

/**
 * Przeciąganie elementu zdarzeniami wskaźnika (mysz i dotyk): „duch” przy kursorze,
 * podświetlenie strefy upuszczania i callback upuszczenia. Działa też między lewym ekranem
 * a prawym monitorem, bo prawy monitor to portal w tym samym dokumencie, a hak liczy
 * w współrzędnych okna (`clientX/Y` i `getBoundingClientRect`).
 *
 * Stan jest zwykłym stanem Reacta (zasada „aplikacje pamiętają stan”: nic nie trafia do store'a).
 * Duch: `<DragGhost dragging={drag.dragging}>…</DragGhost>`.
 * Zob. docs/scenario-engine.md, sekcja 3.
 *
 * ```tsx
 * const drag = usePointerDrag<string>({ onDrop: ({ itemId }) => addFile(itemId), onTap: addFile });
 * <button {...drag.getDragProps(file.id)} className={drag.draggedId === file.id ? 'opacity-40' : ''}>…</button>
 * <div ref={drag.zoneRef('usb')} className={drag.isOver('usb') ? 'border-green-400' : ''}>…</div>
 * ```
 */
export function usePointerDrag<T extends string = string>(options: UsePointerDragOptions<T>): PointerDragApi<T> {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const zonesRef = useRef(new Map<string, HTMLElement>());
  const zoneRefCallbacks = useRef(new Map<string, (el: HTMLElement | null) => void>());
  const [state, setState] = useState<PointerDragState<T> | null>(null);
  // Ostatni stan w ref — handlery okna czytają go bez zależności od renderu.
  const stateRef = useRef<PointerDragState<T> | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const active = state !== null;

  const commit = (next: PointerDragState<T> | null) => {
    stateRef.current = next;
    setState(next);
  };

  const readZones = useCallback((): DropZoneRect[] => {
    const out: DropZoneRect[] = [];
    zonesRef.current.forEach((el, id) => {
      const r = el.getBoundingClientRect();
      out.push({ id, rect: { left: r.left, top: r.top, right: r.right, bottom: r.bottom } });
    });
    return out;
  }, []);

  const acceptsFn = (itemId: T, zoneId: string) => optionsRef.current.accepts?.(itemId, zoneId) ?? true;
  const threshold = () => optionsRef.current.threshold ?? DEFAULT_DRAG_THRESHOLD;

  useEffect(() => {
    if (!active) return;

    const onMove = (e: PointerEvent) => {
      if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) return;
      const cur = stateRef.current;
      if (!cur) return;
      commit(moveDrag(cur, e.clientX, e.clientY, readZones(), acceptsFn, threshold()));
    };

    const onUp = (e: PointerEvent) => {
      if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) return;
      const cur = stateRef.current;
      if (!cur) return;
      const outcome = releaseDrag(cur, e.clientX, e.clientY, readZones(), acceptsFn, threshold());
      commit(null);
      pointerIdRef.current = null;
      if (outcome.kind === 'drop') {
        optionsRef.current.onDrop({ itemId: outcome.itemId, zoneId: outcome.zoneId, x: outcome.x, y: outcome.y });
      } else if (outcome.kind === 'tap') {
        optionsRef.current.onTap?.(outcome.itemId);
      } else {
        optionsRef.current.onCancel?.(outcome.itemId);
      }
    };

    const cancel = () => {
      const cur = stateRef.current;
      commit(null);
      pointerIdRef.current = null;
      if (cur?.moved) optionsRef.current.onCancel?.(cur.itemId);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cancel();
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', cancel);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', cancel);
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const getDragProps = useCallback(
    (itemId: T) => ({
      onPointerDown: (e: React.PointerEvent) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        if (stateRef.current) return;
        if (optionsRef.current.canDrag && !optionsRef.current.canDrag(itemId)) return;
        e.preventDefault();
        pointerIdRef.current = e.pointerId;
        try {
          // Przechwycenie wskaźnika: ruch i puszczenie dochodzą nawet poza oknem przeglądarki.
          (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
        } catch {
          /* niektóre przeglądarki odmawiają przechwycenia — okno i tak nasłuchuje */
        }
        commit(pressDrag(itemId, e.clientX, e.clientY));
      },
      onDragStart: (e: React.DragEvent) => e.preventDefault(),
      // Bez tego przeglądarka dotykowa przewija stronę zamiast przeciągać.
      style: { touchAction: 'none', userSelect: 'none' } as React.CSSProperties
    }),
    []
  );

  const zoneRef = useCallback((zoneId: string) => {
    let cb = zoneRefCallbacks.current.get(zoneId);
    if (!cb) {
      cb = (el: HTMLElement | null) => {
        if (el) zonesRef.current.set(zoneId, el);
        else zonesRef.current.delete(zoneId);
      };
      zoneRefCallbacks.current.set(zoneId, cb);
    }
    return cb;
  }, []);

  const dragging = state && state.moved ? { itemId: state.itemId, x: state.x, y: state.y, overZone: state.overZone } : null;

  return {
    dragging,
    draggedId: dragging ? dragging.itemId : null,
    getDragProps,
    zoneRef,
    isDropTarget: (zoneId: string) =>
      dragging !== null && (optionsRef.current.accepts?.(dragging.itemId, zoneId) ?? true),
    isOver: (zoneId: string) => dragging !== null && dragging.overZone === zoneId
  };
}

/**
 * „Duch” przy kursorze: dowolna zawartość podążająca za wskaźnikiem w trakcie przeciągania.
 * Renderowany portalem do `document.body`, więc nie obcina go ani `overflow`, ani transformacja
 * (skalowanie ekranu) przodków.
 */
export const DragGhost: React.FC<{
  dragging: { x: number; y: number } | null;
  children: React.ReactNode;
  className?: string;
}> = ({ dragging, children, className }) => {
  if (!dragging || typeof document === 'undefined') return null;
  return createPortal(
    <div
      className={className ?? 'px-3 py-2 rounded-lg border-2 border-white/40 bg-[#07131a] font-mono text-xs font-bold text-white shadow-xl'}
      style={{ position: 'fixed', zIndex: 9999, pointerEvents: 'none', left: dragging.x + 12, top: dragging.y + 12 }}
    >
      {children}
    </div>,
    document.body
  );
};
