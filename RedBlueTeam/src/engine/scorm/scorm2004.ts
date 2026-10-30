// SCORM 2004 (4th Edition) API Bridge & Tracking Engine
// Supports both iframe embedded mode and popup/new tab mode (scanning window.opener)

export interface ScormInteraction {
  id: string;
  type: 'choice' | 'true-false' | 'fill-in' | 'long-fill-in' | 'matching' | 'performance' | 'sequencing' | 'likert' | 'numeric' | 'other';
  description: string;
  learnerResponse: string;
  result: 'correct' | 'incorrect' | 'unanticipated' | 'neutral';
  timestamp?: string;
}

export interface ScormSubmissionData {
  scoreRaw: number; // 0 - 100
  scoreMin?: number;
  scoreMax?: number;
  passingScore?: number; // default 70
  sessionSeconds: number;
  interactions?: ScormInteraction[];
  suspendData?: string;
  location?: string;
  missionId?: string;
}

export interface SCORM2004API {
  Initialize: (param: string) => string;
  Terminate: (param: string) => string;
  GetValue: (element: string) => string;
  SetValue: (element: string, value: string) => string;
  Commit: (param: string) => string;
  GetLastError: () => string;
  GetErrorString: (errorCode: string) => string;
  GetDiagnostic: (errorCode: string) => string;
}

// Convert seconds into ISO 8601 Duration (e.g. 95 seconds -> PT1M35S)
export function formatIso8601Duration(totalSeconds: number): string {
  const safeSec = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSec / 3600);
  const minutes = Math.floor((safeSec % 3600) / 60);
  const seconds = safeSec % 60;

  let result = 'PT';
  if (hours > 0) result += `${hours}H`;
  if (minutes > 0 || hours > 0) result += `${minutes}M`;
  result += `${seconds}S`;
  return result;
}

export class MockSCORM2004 implements SCORM2004API {
  public data: Record<string, string> = {};
  public isInitialized = false;
  public isTerminated = false;
  public commitCount = 0;

  Initialize(_param: string): string {
    this.isInitialized = true;
    this.data['cmi.completion_status'] = 'incomplete';
    this.data['cmi.success_status'] = 'unknown';
    console.log('[MockSCORM2004] Initialize called');
    return 'true';
  }

  Terminate(_param: string): string {
    this.isTerminated = true;
    console.log('[MockSCORM2004] Terminate called with data:', this.data);
    return 'true';
  }

  GetValue(element: string): string {
    return this.data[element] || '';
  }

  SetValue(element: string, value: string): string {
    this.data[element] = value;
    console.log(`[MockSCORM2004] SetValue: ${element} = ${value}`);
    return 'true';
  }

  Commit(_param: string): string {
    this.commitCount++;
    console.log('[MockSCORM2004] Commit called');
    return 'true';
  }

  GetLastError(): string {
    return '0';
  }

  GetErrorString(_errorCode: string): string {
    return 'No error';
  }

  GetDiagnostic(_errorCode: string): string {
    return 'Mock diagnostic';
  }
}

class Scorm2004Manager {
  private api: SCORM2004API | null = null;
  private isConnected = false;
  private isMock = false;
  private startTime: number = Date.now();

  /**
   * Search for API_1484_11 in window, parents, and window.opener (for new tab mode)
   */
  public findApi(win?: any): SCORM2004API | null {
    if (typeof window === 'undefined' && !win) {
      return null;
    }

    let attempts = 0;
    let currentWin = win || (typeof window !== 'undefined' ? window : null);
    if (!currentWin) return null;

    // 1. Search current window and parent hierarchy
    while (currentWin && attempts < 10) {
      attempts++;
      try {
        if ((currentWin as any).API_1484_11) {
          return (currentWin as any).API_1484_11;
        }
      } catch (e) {
        // Cross-origin access block
        break;
      }

      if (currentWin === currentWin.parent || !currentWin.parent) {
        break;
      }
      currentWin = currentWin.parent;
    }

    // 2. Search window.opener hierarchy (critical for Moodle new tab / popup mode)
    try {
      const targetOpener = (win && win.opener) || (typeof window !== 'undefined' ? window.opener : null);
      if (targetOpener && typeof targetOpener === 'object') {
        let openerWin: any = targetOpener;
        let openerAttempts = 0;
        while (openerWin && openerAttempts < 10) {
          openerAttempts++;
          try {
            if (openerWin.API_1484_11) {
              return openerWin.API_1484_11;
            }
          } catch (e) {
            break;
          }

          if (openerWin === openerWin.parent || !openerWin.parent) {
            break;
          }
          openerWin = openerWin.parent;
        }
      }
    } catch (e) {
      console.warn('[SCORM 2004] Could not access window.opener due to cross-origin restriction:', e);
    }

    return null;
  }

  public initialize(mockFallback = true): boolean {
    this.startTime = Date.now();
    const foundApi = this.findApi();

    if (foundApi) {
      this.api = foundApi;
      this.isMock = false;
    } else if (mockFallback) {
      console.warn('[SCORM 2004] No LMS API_1484_11 found in window or window.opener. Initializing MockSCORM2004.');
      this.api = new MockSCORM2004();
      this.isMock = true;
    } else {
      console.error('[SCORM 2004] Failed to find API_1484_11.');
      return false;
    }

    try {
      const res = this.api.Initialize('');
      this.isConnected = res === 'true';
      if (this.isConnected) {
        console.log('[SCORM 2004] Initialized successfully. Mode:', this.isMock ? 'MOCK' : 'LIVE LMS');
        this.terminateOnPageHide();
      }
      return this.isConnected;
    } catch (err) {
      console.error('[SCORM 2004] Exception during Initialize:', err);
      return false;
    }
  }

  /** Zamknięcie karty kończy sesję, żeby Moodle domknął próbę z ostatnim zapisanym wynikiem. */
  private pageHideHooked = false;
  private terminateOnPageHide(): void {
    if (this.pageHideHooked || typeof window === 'undefined') return;
    this.pageHideHooked = true;
    window.addEventListener('pagehide', () => this.terminate());
  }

  public getApi(): SCORM2004API | null {
    return this.api;
  }

  public isUsingMock(): boolean {
    return this.isMock;
  }

  public getElapsedTimeSeconds(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  public setValue(element: string, value: string): boolean {
    if (!this.api || !this.isConnected) return false;
    try {
      const res = this.api.SetValue(element, value);
      return res === 'true';
    } catch (err) {
      console.error(`[SCORM 2004] Error setting ${element}:`, err);
      return false;
    }
  }

  public getValue(element: string): string {
    if (!this.api || !this.isConnected) return '';
    try {
      return this.api.GetValue(element);
    } catch (err) {
      console.error(`[SCORM 2004] Error getting ${element}:`, err);
      return '';
    }
  }

  public commit(): boolean {
    if (!this.api || !this.isConnected) return false;
    try {
      return this.api.Commit('') === 'true';
    } catch (err) {
      console.error('[SCORM 2004] Error during Commit:', err);
      return false;
    }
  }

  public terminate(): boolean {
    if (!this.api || !this.isConnected) return false;
    try {
      const res = this.api.Terminate('') === 'true';
      this.isConnected = false;
      return res;
    } catch (err) {
      console.error('[SCORM 2004] Error during Terminate:', err);
      return false;
    }
  }

  public reset(): void {
    this.api = null;
    this.isConnected = false;
    this.isMock = false;
    this.startTime = Date.now();
  }

  /**
   * Submit complete final results, scoring, time and interactions to Moodle,
   * then terminate the session.
   */
  public submitFinalScore(data: ScormSubmissionData): { success: boolean; message: string } {
    const result = this.saveResult(data);
    if (result.success) this.terminate();
    return result;
  }

  /**
   * Zapisuje wynik, czas i interakcje do Moodle (Commit) BEZ kończenia sesji.
   * Można wołać wielokrotnie — kolejny zapis nadpisuje poprzedni. Silnik woła to
   * zaraz po ostatniej decyzji misji, żeby wynik był w dzienniku ocen, nawet gdy
   * gracz zamknie kartę przed raportem pooperacyjnym.
   */
  public saveResult(data: ScormSubmissionData): { success: boolean; message: string } {
    if (!this.api || !this.isConnected) {
      this.initialize(true);
    }

    if (!this.api || !this.isConnected) {
      return { success: false, message: 'Nie odnaleziono interfejsu SCORM 2004.' };
    }

    const passingScore = data.passingScore ?? 70;
    const isPassed = data.scoreRaw >= passingScore;
    const scoreScaled = +(data.scoreRaw / 100).toFixed(2);
    const durationIso = formatIso8601Duration(data.sessionSeconds);

    try {
      // 1. Completion & Success status
      this.setValue('cmi.completion_status', 'completed');
      this.setValue('cmi.success_status', isPassed ? 'passed' : 'failed');
      this.setValue('cmi.exit', 'normal');

      // 2. Score parameters
      this.setValue('cmi.score.raw', data.scoreRaw.toString());
      this.setValue('cmi.score.scaled', scoreScaled.toString());
      this.setValue('cmi.score.min', (data.scoreMin ?? 0).toString());
      this.setValue('cmi.score.max', (data.scoreMax ?? 100).toString());

      // 3. Location and Session Time
      const finalLocation = data.location || (data.missionId ? `${data.missionId}_debriefing_completed` : 'mission3_debriefing_completed');
      this.setValue('cmi.location', finalLocation);
      this.setValue('cmi.session_time', durationIso);

      // 4. Suspend data
      if (data.suspendData) {
        this.setValue('cmi.suspend_data', data.suspendData);
      }

      // 5. Interactions (cmi.interactions.n.*)
      if (data.interactions && data.interactions.length > 0) {
        data.interactions.forEach((inter, idx) => {
          this.setValue(`cmi.interactions.${idx}.id`, inter.id);
          this.setValue(`cmi.interactions.${idx}.type`, inter.type);
          this.setValue(`cmi.interactions.${idx}.description`, inter.description);
          this.setValue(`cmi.interactions.${idx}.learner_response`, inter.learnerResponse);
          this.setValue(`cmi.interactions.${idx}.result`, inter.result);
          if (inter.timestamp) {
            this.setValue(`cmi.interactions.${idx}.timestamp`, inter.timestamp);
          }
        });
      }

      // 6. Commit to LMS database
      this.commit();

      return {
        success: true,
        message: isPassed
          ? `Wynik ${data.scoreRaw}/100 pkt został pomyślnie zapisany w Moodle jako ZALICZONY (passed).`
          : `Wynik ${data.scoreRaw}/100 pkt został zapisany w Moodle jako NIEZALICZONY (failed, próg: ${passingScore}%).`
      };
    } catch (err: any) {
      console.error('[SCORM 2004] Error during saveResult:', err);
      return { success: false, message: `Błąd zapisu w SCORM: ${err?.message || err}` };
    }
  }
}

export const scorm2004 = new Scorm2004Manager();
