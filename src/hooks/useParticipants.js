import { useEffect, useState } from 'react'
import { fetchParticipants, subscribeToParticipants } from '@/services/participantService'

export function useParticipants(sessionId) {
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) return

    setLoading(true)
    let mounted = true

    const unsubscribe = subscribeToParticipants(sessionId, (list) => {
      if (mounted) {
        setParticipants(list)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [sessionId])

  return { participants, loading, count: participants.length }
}
