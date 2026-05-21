export default function EnvSetup() {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
        background: '#020617',
        color: '#e2e8f0',
      }}
    >
      <div style={{ maxWidth: '32rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
          QuizLive — configuration required
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '1rem', lineHeight: 1.6 }}>
          Supabase environment variables are missing. The app cannot start until they
          are set.
        </p>
        <ol style={{ color: '#cbd5e1', lineHeight: 1.8, paddingLeft: '1.25rem' }}>
          <li>
            Copy <code style={{ color: '#a5b4fc' }}>.env.example</code> to{' '}
            <code style={{ color: '#a5b4fc' }}>.env.local</code> in the project root
          </li>
          <li>
            Add your <strong>Project URL</strong> and <strong>anon key</strong> from
            Supabase → Project Settings → API
          </li>
          <li>
            For <code style={{ color: '#a5b4fc' }}>npm run preview</code>: run{' '}
            <code style={{ color: '#a5b4fc' }}>npm run build</code> again after saving
            .env.local (Vite bakes env vars at build time)
          </li>
          <li>
            For development, use <code style={{ color: '#a5b4fc' }}>npm run dev</code>{' '}
            (reads .env.local automatically)
          </li>
        </ol>
        <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
          Current: URL {url ? '✓ set' : '✗ missing'}, key{' '}
          {key ? '✓ set' : '✗ missing'}
        </p>
      </div>
    </div>
  )
}
