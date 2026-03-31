import './globals.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SettingsWindow } from './settings/settings-window'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsWindow />
  </StrictMode>
)
