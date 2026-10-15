import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { useMissionStore } from './engine/store/useMissionStore'

if (typeof window !== 'undefined') {
  (window as any).__STORE__ = useMissionStore;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
