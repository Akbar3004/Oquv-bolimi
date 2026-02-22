import { Buffer } from 'buffer';
globalThis.Buffer = Buffer;

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { WorkersProvider } from './contexts/WorkersContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WorkersProvider>
      <App />
    </WorkersProvider>
  </StrictMode>,
)
