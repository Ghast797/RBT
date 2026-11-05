import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { useMissionStore } from './engine/store/useMissionStore'
import { fillLmsPopupWindow } from './engine/scorm/lmsFrame'

if (typeof window !== 'undefined') {
  (window as any).__STORE__ = useMissionStore;
  fillLmsPopupWindow();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
