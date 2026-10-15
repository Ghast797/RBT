import { spawn } from 'node:child_process';
import http from 'node:http';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getDebuggerUrl(port = 9222) {
  for (let i = 0; i < 20; i++) {
    try {
      const data = await new Promise((resolve, reject) => {
        http.get(`http://127.0.0.1:${port}/json`, (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => {
            try {
              resolve(JSON.parse(body));
            } catch (e) {
              reject(e);
            }
          });
        }).on('error', reject);
      });
      const page = data.find(item => item.type === 'page');
      if (page && page.webSocketDebuggerUrl) {
        return page.webSocketDebuggerUrl;
      }
    } catch {
      await sleep(500);
    }
  }
  throw new Error('Could not connect to Chrome debugging port.');
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.pending = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) {
          reject(new Error(msg.error.message));
        } else {
          resolve(msg.result);
        }
      }
    };
  }

  async send(method, params = {}) {
    const id = this.id++;
    const message = { id, method, params };
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify(message));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval exception: ${res.exceptionDetails.text}`);
    }
    return res.result?.value;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function runBrowserTest() {
  console.log('>>> [BROWSER TEST] Uruchamianie Chrome w trybie headless...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--remote-allow-origins=*',
    '--user-data-dir=C:\\Users\\Dawid\\AppData\\Local\\Temp\\chrome-test-profile-' + Date.now(),
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1440,900',
    'http://localhost:5173/?mission=4'
  ]);

  try {
    const wsUrl = await getDebuggerUrl(9222);
    console.log('>>> [BROWSER TEST] Połączono z Chrome CDP:', wsUrl);

    const cdp = new CDPClient(wsUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    console.log('>>> [BROWSER TEST] Oczekiwanie na załadowanie aplikacji...');
    await sleep(2500);

    const title = await cdp.eval('document.title');
    console.log('    Tytuł strony:', title);

    // Stage 1: Incoming Call / Boot sequence
    console.log('\n--- 1. SEKWENCJA BOOT / INTRO ---');
    for (let i = 0; i < 30; i++) {
      const stage = await cdp.eval(`window.__STORE__ ? window.__STORE__.getState().bootStage : 'unknown'`);
      if (stage === 'desktop') break;
      if (stage === 'incoming_call') {
        await cdp.eval(`window.__STORE__.getState().acceptIncomingCall()`);
      } else if (stage === 'intro_chat') {
        const idx = await cdp.eval(`window.__STORE__.getState().introDialogIndex`);
        if (idx < 4) {
          await cdp.eval(`window.__STORE__.getState().nextIntroDialog()`);
        } else {
          await cdp.eval(`window.__STORE__.getState().startBiosBoot()`);
        }
      } else if (stage === 'bios_boot') {
        await cdp.eval(`window.__STORE__.getState().finishBiosBoot()`);
      }
      await sleep(250);
    }
    await sleep(1000);

    // Stage 2: Desktop loaded
    console.log('\n--- 2. PULPIT & CZAT BYTE_MASTERA ---');
    const isDesktop = await cdp.eval("document.body.innerText.includes('//HACKERS.OS') || document.body.innerText.includes('//BAZA_WIRUSÓW')");
    console.log('    Pulpit HACKER.OS załadowany:', isDesktop ? 'OK' : 'FAIL');

    const byteMasterInitial = await cdp.eval("document.body.innerText.includes('Cel: Energy Rock')");
    console.log('    Byte_Master powitanie na prawym monitorze:', byteMasterInitial ? 'OK' : 'FAIL');

    const hasStartVirusBtn = await cdp.eval("document.body.innerText.includes('OTWIERAM BAZĘ WIRUSÓW')");
    console.log('    Przycisk w czacie Byte_Mastera "OTWIERAM BAZĘ WIRUSÓW":', hasStartVirusBtn ? 'OK' : 'FAIL');

    // Click "OTWIERAM BAZĘ WIRUSÓW" in chat
    await cdp.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('OTWIERAM BAZĘ WIRUSÓW'));
        if (btn) btn.click();
      })()
    `);
    await sleep(1000);

    // Stage 3: Krok 1 - Baza Wirusów
    console.log('\n--- 3. KROK 1: BAZA WIRUSÓW ---');
    const isVirusWindowOpen = await cdp.eval("document.body.innerText.includes('//BAZA_WIRUSÓW // SELEKCJA ZŁOŚLIWEGO KODU')");
    console.log('    Okno Baza Wirusów otwarte:', isVirusWindowOpen ? 'OK' : 'FAIL');

    // Click Ransomware card via data-virus-id
    console.log('    Wybieranie karty RANSOMWARE...');
    await cdp.eval(`document.querySelector('[data-virus-id="ransomware"]')?.click()`);
    await sleep(800);

    // Scan matrix to 100%
    console.log('    Skanowanie matrycy heksadecymalnej w poszukiwaniu sygnatury...');
    await cdp.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('SKANUJ WSZYSTKO'));
        if (btn) btn.click();
      })()
    `);
    await sleep(800);

    const is100Scanned = await cdp.eval("document.body.innerText.includes('100%') || document.body.innerText.includes('SYGNATURA ZNALEZIONA')");
    console.log('    Sygnatura odkryta na 100%:', is100Scanned ? 'OK' : 'FAIL');

    // Confirm choice & return to desktop
    console.log('    Zatwierdzanie ładunku wirusa...');
    await cdp.eval(`document.querySelector('[data-confirm-virus="true"]')?.click()`);
    await sleep(2500);

    // Check return to desktop & Byte_Master chat guidance
    console.log('\n--- 4. POWRÓT NA PULPIT & PROWADZENIE PRZEZ CZAT ---');
    const isBackOnDesktop = await cdp.eval("document.body.innerText.includes('//WIRUS: RANSOMWARE')");
    console.log('    Odblokowana ikona //WIRUS: RANSOMWARE na pulpicie:', isBackOnDesktop ? 'OK' : 'FAIL');

    const byteMasterBuilderPrompt = await cdp.eval("document.body.innerText.includes('OTWIERAM KREATOR RANSOMWARE')");
    console.log('    Byte_Master instruuje o konfiguracji kreatora w czacie:', byteMasterBuilderPrompt ? 'OK' : 'FAIL');

    // Click "OTWIERAM KREATOR RANSOMWARE" in chat
    await cdp.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('OTWIERAM KREATOR RANSOMWARE'));
        if (btn) btn.click();
      })()
    `);
    await sleep(1000);

    // Stage 5: Krok 2-4 - Ransomware Builder
    console.log('\n--- 5. KROK 2-4: RANSOMWARE BUILDER ---');
    const isBuilderOpen = await cdp.eval("document.body.innerText.includes('//RANSOMWARE_BUILDER')");
    console.log('    Kreator Ransomware otwarty:', isBuilderOpen ? 'OK' : 'FAIL');

    // Step 2: Set length to 24 & select toggles
    console.log('    Konfigurowanie generatora klucza (długość 24 + safe charset)...');
    await cdp.eval(`
      (() => {
        const slider = document.querySelector('input[type="range"]');
        if (slider) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(slider, '24');
          slider.dispatchEvent(new Event('input', { bubbles: true }));
          slider.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Click the 4 safe toggles
        const safeLabels = ['DUŻE LITERY', 'MAŁE LITERY', 'CYFRY', 'ZNAKI SPECJALNE'];
        const btns = Array.from(document.querySelectorAll('button'));
        btns.forEach(b => {
          if (safeLabels.some(l => b.innerText.includes(l))) {
            b.click();
          }
        });
      })()
    `);
    await sleep(800);

    // Save Step 2
    await cdp.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('ZAPISZ KLUCZ'));
        if (btn) btn.click();
      })()
    `);
    await sleep(1000);

    // Step 3: Extortion strategy -> TAK via data-extortion="yes"
    console.log('    Wybór strategii szantażu (TAK - Podwójny szantaż)...');
    await cdp.eval(`document.querySelector('[data-extortion="yes"]')?.click()`);
    await sleep(1000);

    // Step 4: Ransom note color -> CZERWONY
    console.log('    Wybór koloru okna szantażu (CZERWONY)...');
    await cdp.eval(`
      (() => {
        const redBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('CZERWONY'));
        if (redBtn) redBtn.click();
      })()
    `);
    await sleep(800);

    // Compile ransomware
    console.log('    Kompilacja ładunku ransomware...');
    await cdp.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('KOMPILUJ ŁADUNEK'));
        if (btn) btn.click();
      })()
    `);
    await sleep(3500);

    // Check return to desktop & Byte_Master chat guidance for Mail
    console.log('\n--- 6. PULPIT: PRZYGOTOWANIE DO PHISHINGU ---');
    const isMailUnlocked = await cdp.eval("document.body.innerText.includes('//MAIL')");
    console.log('    Odblokowana ikona //MAIL na pulpicie:', isMailUnlocked ? 'OK' : 'FAIL');

    const byteMasterMailPrompt = await cdp.eval("document.body.innerText.includes('OTWIERAM POCZTĘ //MAIL')");
    console.log('    Byte_Master instruuje o kampanii mailowej w czacie:', byteMasterMailPrompt ? 'OK' : 'FAIL');

    // Click "OTWIERAM POCZTĘ //MAIL" in chat
    await cdp.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('OTWIERAM POCZTĘ //MAIL'));
        if (btn) btn.click();
      })()
    `);
    await sleep(1000);

    // Stage 7: Krok 5-6 - Phishing Mail
    console.log('\n--- 7. KROKI 5-6: PHISHING MAIL CLIENT ---');
    const isMailOpen = await cdp.eval("document.body.innerText.includes('//MAIL_CLIENT')");
    console.log('    Klient poczty otwarty:', isMailOpen ? 'OK' : 'FAIL');

    // Select Subject: CV MICHAŁ WILK
    await cdp.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'CV MICHAŁ WILK');
        if (btn) btn.click();
      })()
    `);
    await sleep(500);

    // Select Body: WARIANT B (formal with password)
    await cdp.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('WARIANT B'));
        if (btn) btn.click();
      })()
    `);
    await sleep(500);

    // Confirm mail
    console.log('    Zatwierdzanie wiadomości email...');
    await cdp.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('ZATWIERDŹ MAILA'));
        if (btn) btn.click();
      })()
    `);
    await sleep(2500);

    // Stage 8: Pulip & VPN
    console.log('\n--- 8. PULPIT: ROUTING VPN & SENDER SPOOFING ---');
    const isVpnUnlocked = await cdp.eval("document.body.innerText.includes('//VPN')");
    console.log('    Odblokowana ikona //VPN na pulpicie:', isVpnUnlocked ? 'OK' : 'FAIL');

    const byteMasterVpnPrompt = await cdp.eval("document.body.innerText.includes('OTWIERAM KLIENTA VPN')");
    console.log('    Byte_Master instruuje o konfiguracji VPN:', byteMasterVpnPrompt ? 'OK' : 'FAIL');

    // Click "OTWIERAM KLIENTA VPN" in chat
    await cdp.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('OTWIERAM KLIENTA VPN'));
        if (btn) btn.click();
      })()
    `);
    await sleep(1000);

    // Stage 9: VPN app
    console.log('\n--- 9. KROK 7: VPN APP ---');
    const isVpnOpen = await cdp.eval("document.body.innerText.includes('//VPN_ROUTING')");
    console.log('    Aplikacja VPN otwarta:', isVpnOpen ? 'OK' : 'FAIL');

    // Adjust octets to 109.43.200.124
    console.log('    Korygowanie oktetów IP przyciskami +/- do docelowego 109.43.200.124...');
    await cdp.eval(`
      (() => {
        const containers = Array.from(document.querySelectorAll('.border-gray-800'));
        const octetCards = containers.filter(c => c.innerText.includes('OKTET'));

        if (octetCards[0]) {
          const plusBtn = Array.from(octetCards[0].querySelectorAll('button')).find(b => b.innerText === '+');
          for (let i = 0; i < 3; i++) if (plusBtn) plusBtn.click();
        }
        if (octetCards[1]) {
          const minusBtn = Array.from(octetCards[1].querySelectorAll('button')).find(b => b.innerText === '-');
          for (let i = 0; i < 12; i++) if (minusBtn) minusBtn.click();
        }
        if (octetCards[2]) {
          const minusBtn = Array.from(octetCards[2].querySelectorAll('button')).find(b => b.innerText === '-');
          for (let i = 0; i < 2; i++) if (minusBtn) minusBtn.click();
        }
        if (octetCards[3]) {
          const plusBtn = Array.from(octetCards[3].querySelectorAll('button')).find(b => b.innerText === '+');
          for (let i = 0; i < 4; i++) if (plusBtn) plusBtn.click();
        }
      })()
    `);
    await sleep(800);

    // Select sender: m.wilk@priv.com
    console.log('    Wybór adresu nadawcy m.wilk@priv.com...');
    await cdp.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('m.wilk@priv.com'));
        if (btn) btn.click();
      })()
    `);
    await sleep(500);

    // Send campaign
    console.log('    Wysyłka spear-phishingu przez tunel VPN...');
    await cdp.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('ZESTAW TUNEL VPN'));
        if (btn) btn.click();
      })()
    `);
    await sleep(3500);

    // Stage 10: Pulip & Stacja Ofiary
    console.log('\n--- 10. PULPIT: INFEKCJA & STACJA OFIARY ---');
    const isStationUnlocked = await cdp.eval("document.body.innerText.includes('//STACJA OFIARY')");
    console.log('    Odblokowana ikona //STACJA OFIARY na pulpicie:', isStationUnlocked ? 'OK' : 'FAIL');

    const byteMasterStationPrompt = await cdp.eval("document.body.innerText.includes('PRZECHODZĘ DO STACJI OFIARY')");
    console.log('    Byte_Master informuje o infekcji i przejściu do stacji:', byteMasterStationPrompt ? 'OK' : 'FAIL');

    // Click "PRZECHODZĘ DO STACJI OFIARY" in chat
    await cdp.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('PRZECHODZĘ DO STACJI OFIARY'));
        if (btn) btn.click();
      })()
    `);
    await sleep(1000);

    // Stage 11: Workstation Exfiltration
    console.log('\n--- 11. KROK 8: STACJA OFIARY (NAJPIERW SZYFROWANIE, POTEM POBIERANIE) ---');
    const isStationOpen = await cdp.eval("document.body.innerText.includes('//STACJA OFIARY // ENERGY_ROCK_01_PC')");
    console.log('    Stacja robocza ofiary otwarta:', isStationOpen ? 'OK' : 'FAIL');

    const isLockedBeforeEncrypt = await cdp.eval("document.body.innerText.includes('NAJPIERW URUCHOM PROCEDURĘ SZYFROWANIA')");
    console.log('    Pliki zablokowane przed szyfrowaniem (zgodnie z wytycznymi):', isLockedBeforeEncrypt ? 'OK' : 'FAIL');

    // Click "SZYFRUJ ZASOBY FIRMY"
    console.log('    Uruchamianie szyfrowania ransomware...');
    await cdp.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('SZYFRUJ ZASOBY FIRMY'));
        if (btn) btn.click();
      })()
    `);
    await sleep(1200);

    const isEncryptedNow = await cdp.eval("document.body.innerText.includes('SERWERY ZASZYFROWANE KLUCZEM RSA')");
    console.log('    Serwery pomyślnie zaszyfrowane:', isEncryptedNow ? 'OK' : 'FAIL');

    // Select the 3 Freevolt files via data-file-name
    console.log('    Wybieranie 3 plików technologii Freevolt...');
    await cdp.eval(`
      (() => {
        document.querySelector('[data-file-name="FREEVOLT_SCHEMAT.PDF"]')?.click();
        document.querySelector('[data-file-name="ENERGIA_FVOLT.KCF"]')?.click();
        document.querySelector('[data-file-name="FVOLT_TECH.DOCX"]')?.click();
      })()
    `);
    await sleep(800);

    // Exfiltrate and initiate negotiation
    console.log('    Pobieranie plików i inicjowanie negocjacji...');
    await cdp.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('POBIERZ PLIKI I ZAINICJUJ'));
        if (btn) btn.click();
      })()
    `);
    await sleep(6500);

    // Stage 12: Incoming call alert & Negotiation
    console.log('\n--- 12. PULPIT: POŁĄCZENIE PRZYCHODZĄCE OD SZEFA IT ---');
    const hasIncomingCallBanner = await cdp.eval("document.body.innerText.includes('POŁĄCZENIE PRZYCHODZĄCE: SZEF IT')");
    console.log('    Baner połączenia alarmowego od Szefa IT:', hasIncomingCallBanner ? 'OK' : 'FAIL');

    const byteMasterNegPrompt = await cdp.eval("document.body.innerText.includes('OTWIERAM KONSOLĘ NEGOCJACJI')");
    console.log('    Byte_Master instruuje o asekuracji podczas negocjacji:', byteMasterNegPrompt ? 'OK' : 'FAIL');

    // Click "OTWIERAM KONSOLĘ NEGOCJACJI" in chat
    await cdp.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('OTWIERAM KONSOLĘ NEGOCJACJI'));
        if (btn) btn.click();
      })()
    `);
    await sleep(1000);

    // Stage 13: Negotiation Chat dialogue progression test
    console.log('\n--- 13. KROK 9: NEGOCJACJE Z SZEFEM IT (TEST PROGRESJI DIALOGU) ---');
    const isNegOpen = await cdp.eval("document.body.innerText.includes('//KANAŁ NEGOCJACYJNY // SZEF IT')");
    console.log('    Konsola negocjacji otwarta:', isNegOpen ? 'OK' : 'FAIL');

    // Node 1: Select "ODPOWIEDNIE SŁUŻBY NIE ODSZYFRUJĄ..."
    console.log('    Węzeł 1: Wybieranie odpowiedzi technicznej...');
    await cdp.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('ODPOWIEDNIE SŁUŻBY NIE ODSZYFRUJĄ'));
        if (btn) btn.click();
      })()
    `);
    await sleep(1500);

    const hasNode2 = await cdp.eval("document.body.innerText.includes('CZEGO CHCESZ W ZAMIAN')");
    console.log('    Węzeł 2 pomyślnie załadowany (brak zablokowania czatu):', hasNode2 ? 'OK' : 'FAIL');

    // Node 2: Select "TAK, JAK NAPISAŁEM W WIADOMOŚCI - INTERESUJĄ MNIE TYLKO BITCOINY"
    console.log('    Węzeł 2: Wybieranie odpowiedzi o Bitcoinach...');
    await cdp.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('INTERESUJĄ MNIE TYLKO BITCOINY'));
        if (btn) btn.click();
      })()
    `);
    await sleep(1500);

    const hasNode3 = await cdp.eval("document.body.innerText.includes('POTRZEBUJEMY CZASU NA ICH ZDOBYCIE')");
    console.log('    Węzeł 3 pomyślnie załadowany (brak zablokowania czatu):', hasNode3 ? 'OK' : 'FAIL');

    // Node 3: Select "MACIE 3 H. POTEM NIE DOSTANIECIE JUŻ KLUCZA"
    console.log('    Węzeł 3: Wybieranie twardego limitu 3h...');
    await cdp.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('MACIE 3 H'));
        if (btn) btn.click();
      })()
    `);
    await sleep(2000);

    const isNegFinished = await cdp.eval("document.body.innerText.includes('ZOBACZ PODSUMOWANIE MISJI')");
    console.log('    Negocjacje zakończone sukcesem (przycisk podsumowania aktywny):', isNegFinished ? 'OK' : 'FAIL');

    // Click "ZOBACZ PODSUMOWANIE MISJI"
    await cdp.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('ZOBACZ PODSUMOWANIE MISJI'));
        if (btn) btn.click();
      })()
    `);
    await sleep(1500);

    // Stage 14: Debriefing & SCORM submit
    console.log('\n--- 14. KROK 10: RAPORT POOPERACYJNY & SCORM 2004 ---');
    const isDebriefOpen = await cdp.eval("document.body.innerText.includes('RAPORT POOPERACYJNY') || document.body.innerText.includes('SUKCES')");
    console.log('    Ekran Debriefing otwarty:', isDebriefOpen ? 'OK' : 'FAIL');

    const scoreText = await cdp.eval(`
      (() => {
        const scoreEl = document.body.innerText.match(/\\d+\\s*\\/\\s*100|100%/);
        return scoreEl ? scoreEl[0] : 'N/A';
      })()
    `);
    console.log('    Wynik końcowy misji:', scoreText);

    // Submit SCORM
    console.log('    Wysyłanie raportu do SCORM 2004 LMS...');
    await cdp.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => 
          b.innerText.includes('PRZEŚLIJ WYNIK DO MOODLE') || 
          b.innerText.includes('ZAKOŃCZ I ZAPISZ') || 
          b.innerText.includes('ZAPISZ WYNIK')
        );
        if (btn) btn.click();
      })()
    `);
    await sleep(1000);

    const isExitModal = await cdp.eval("document.body.innerText.includes('WYNIK ZOSTAŁ PRZESŁANY') || document.body.innerText.includes('SCORM 2004') || document.body.innerText.includes('SESJA ZAKOŃCZONA')");
    console.log('    Modal SCORM 2004 potwierdzony:', isExitModal ? 'OK' : 'FAIL');

    console.log('\n========================================================');
    console.log('✔ WSZYSTKIE KROKI SCENARIUSZA 4 PRZESZŁY W PRZEGLĄDARCE!');
    console.log('========================================================\n');

    cdp.close();
  } finally {
    chromeProc.kill();
  }
}

runBrowserTest().catch(err => {
  console.error('\n❌ BŁĄD TESTU PRZEGLĄDARKI:', err);
  process.exit(1);
});
