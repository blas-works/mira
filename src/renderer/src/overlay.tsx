import './globals.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ScreenshotOverlay } from './overlay/screenshot-overlay'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ScreenshotOverlay />
  </StrictMode>
)
