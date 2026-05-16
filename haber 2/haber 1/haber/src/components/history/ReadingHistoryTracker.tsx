'use client'

import { useEffect } from 'react'

export default function ReadingHistoryTracker({ articleId }: { articleId: string }) {
  useEffect(() => {
    const startedAt = Date.now()
    let sent = false

    const send = () => {
      if (sent) return
      sent = true
      const readingTime = Math.round((Date.now() - startedAt) / 1000)
      const scrollDepth = Math.min(1, window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight))

      fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, readingTime, scrollDepth }),
      }).catch(() => undefined)
    }

    const timer = window.setTimeout(send, 2500)
    window.addEventListener('beforeunload', send)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('beforeunload', send)
    }
  }, [articleId])

  return null
}
