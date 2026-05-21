import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import EnvSetup from '@/components/EnvSetup.jsx'

const isConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
)

const root = createRoot(document.getElementById('root'))

async function bootstrap() {
  if (!isConfigured) {
    root.render(
      <StrictMode>
        <EnvSetup />
      </StrictMode>,
    )
    return
  }

  const { default: App } = await import('./App.jsx')
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

bootstrap().catch((err) => {
  console.error(err)
  root.render(
    <div style={{ padding: '2rem', color: '#f87171', fontFamily: 'system-ui' }}>
      Failed to start app: {err.message}
    </div>,
  )
})
