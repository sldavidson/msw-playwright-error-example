import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { setupWorker } from 'msw/browser'
import { handlers } from '../mocks/handlers.ts'

const starting =
  import.meta.env.MODE === 'development'
    ? setupWorker(...handlers).start()
    : Promise.resolve()

starting.then(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
)
