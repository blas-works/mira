import './globals.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { EditorWindow } from './editor/editor-window'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EditorWindow />
  </StrictMode>
)
