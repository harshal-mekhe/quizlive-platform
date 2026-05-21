import { useState } from 'react'
import Button from '@/components/ui/Button'
import { useToast } from '@/contexts/ToastContext'

export default function RoomCodeDisplay({ code, size = 'lg' }) {
  const toast = useToast()
  const [copied, setCopied] = useState(false)

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success('Room code copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy code')
    }
  }

  const textSize = size === 'lg' ? 'text-4xl sm:text-5xl' : 'text-2xl'

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm font-medium uppercase tracking-wider text-slate-400">
        Room code
      </p>
      <div
        className={`font-mono font-bold tracking-[0.35em] text-white ${textSize}`}
        aria-label={`Room code ${code}`}
      >
        {code}
      </div>
      <Button variant="secondary" size="sm" onClick={copyCode}>
        {copied ? 'Copied!' : 'Copy code'}
      </Button>
    </div>
  )
}
