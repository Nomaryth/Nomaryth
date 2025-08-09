'use client'

import { useAuth } from '@/context/auth-context'
import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Terminal, RefreshCw, Shield, MapPin, User, Globe, Clock } from 'lucide-react'

type SecEvent = {
  id: string
  ip?: string
  userAgent?: string
  path?: string
  method?: string
  timestamp: string
  isAuthenticated?: boolean
  userId?: string
  email?: string
  referer?: string
  origin?: string
}

export default function SecurityEventsPage() {
  const { user } = useAuth()
  const [rows, setRows] = useState<SecEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [auto, setAuto] = useState(true)
  const [cursor, setCursor] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const fetchData = async (append = false) => {
    if (!user) return
    try {
      setLoading(true)
      const idToken = await user.getIdToken()
      const url = new URL('/api/admin/sec-events', window.location.origin)
      if (append && cursor) url.searchParams.set('cursor', cursor)
      const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${idToken}` } })
      if (!res.ok) return
      const j = await res.json()
      const data: SecEvent[] = j.data || []
      setRows(prev => (append ? [...prev, ...data] : data))
      setCursor(j.nextCursor || '')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(false)
  }, [user])

  useEffect(() => {
    if (!auto) return
    const id = setInterval(() => fetchData(false), 15000)
    return () => clearInterval(id)
  }, [auto, user])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [rows])

  const formatTs = (ts: string) => new Date(ts).toLocaleString('pt-BR')

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Security Events</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setAuto(v => !v)} className={auto ? 'bg-green-500 text-white' : ''}>
            <RefreshCw className={`w-4 h-4 mr-2 ${auto ? 'animate-spin' : ''}`} />Auto
          </Button>
          <Button variant="outline" size="sm" onClick={() => fetchData(false)} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => fetchData(true)} disabled={loading || !cursor}>
            Load more
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-green-500" /> Events Console
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea ref={scrollRef} className="h-[520px] w-full border rounded-md bg-black text-green-400 font-mono text-sm">
            <div className="p-4 space-y-2">
              {rows.length === 0 ? (
                <div className="text-gray-500 text-center py-8">Sem registros</div>
              ) : (
                rows.map((e) => (
                  <div key={e.id} className="border-l-4 border-amber-500 pl-4 py-2 bg-gray-900 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-white bg-amber-600">{e.isAuthenticated ? 'AUTH' : 'ANON'}</Badge>
                      <span className="text-gray-400 text-xs">{formatTs(e.timestamp)}</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        <span className="text-blue-400">IP:</span>
                        <span className="text-white">{e.ip || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-3 h-3" />
                        <span className="text-blue-400">Path:</span>
                        <span className="text-white">{e.path} {e.method ? '('+e.method+')' : ''}</span>
                      </div>
                      {e.email || e.userId ? (
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3" />
                          <span className="text-blue-400">User:</span>
                          <span className="text-white">{e.email || e.userId}</span>
                        </div>
                      ) : null}
                      {e.userAgent ? (
                        <div className="text-gray-500 truncate">UA: {e.userAgent}</div>
                      ) : null}
                      {e.referer ? (
                        <div className="text-gray-500 truncate">Ref: {e.referer}</div>
                      ) : null}
                      {e.origin ? (
                        <div className="text-gray-500 truncate">Org: {e.origin}</div>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}


