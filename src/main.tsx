import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Styles
import '@/styles/global.css'

// App
import App from '@/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)