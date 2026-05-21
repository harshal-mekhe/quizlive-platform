import { useEffect, useState } from 'react'
import { fetchSessionById, subscribeToSession } from '@/services/sessionService'

export function useSession(sessionId) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!sessionId) return

    let mounted = true

    async function load() {
      try {
        const data = await fetchSessionById(sessionId)
        if (mounted) {
          setSession(data)
          setError(null)
        }
      } catch (err) {
        if (mounted) setError(err.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    const unsubscribe = subscribeToSession(sessionId, (updated) => {
      if (mounted && updated) {
        setSession((prev) => ({ ...prev, ...updated }))
      }
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [sessionId])

  return { session, loading, error }
}
