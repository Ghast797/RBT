# CLAUDE & AGENTS SYSTEM RULES // MISSION 3: O&L COMPANY (HACKERS.OS)

Refer to AGENTS.md for full details.

## Core Rules:
1. **Rule 1 (Data-driven):** All dialogues, options, employee profiles, vehicle coordinates, questions and slides MUST be loaded from `src/data/mission3.json`. Never hardcode game scenario strings in components.
2. **Rule 2 (State isolation):** Global game flow and flags must be stored in Zustand (`src/store/useMissionStore.ts`). Windows can be closed/reopened without losing state.
3. **Rule 3 (Zero external graphics):** All game visuals (parking lot, drone HUD, cars, USB envelope) must be inline SVG React components styled via Tailwind. No png/jpg dependencies for game assets.
4. **Rule 4 (xAPI verification):** Keep scoring and xAPI output strictly conformant with Scenariusz.txt.
