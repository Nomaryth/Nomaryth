import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const githubRateLimit = new Map<string, { count: number; expires: number }>()

function isGithubRateLimited(ip: string): boolean {
  const now = Date.now()
  let entry = githubRateLimit.get(ip)
  if (!entry || entry.expires < now) {
    entry = { count: 1, expires: now + 60000 }
    githubRateLimit.set(ip, entry)
    return false
  }
  entry.count++
  return entry.count > 100
}

setInterval(() => {
  const now = Date.now()
  for (const [key, value] of githubRateLimit.entries()) {
    if (value.expires < now) githubRateLimit.delete(key)
  }
}, 120000)

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               req.headers.get('x-real-ip') || 
               req.headers.get('cf-connecting-ip') || 
               'unknown'
    
    if (isGithubRateLimited(ip)) {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
    }

    const { searchParams } = new URL(req.url)
    const owner = searchParams.get('owner') || ''
    const repo = searchParams.get('repo') || ''
    if (!owner || !repo) return NextResponse.json({ error: 'missing_params' }, { status: 400 })

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/readme`
    const res = await fetch(apiUrl, { headers: { Accept: 'application/vnd.github.v3.raw' }, next: { revalidate: 1800 } })
    if (res.ok) {
      const text = await res.text()
      return new NextResponse(text, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 's-maxage=1800, stale-while-revalidate=86400' } })
    }

    const rawMain = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`, { next: { revalidate: 1800 } })
    if (rawMain.ok) {
      const text = await rawMain.text()
      return new NextResponse(text, { headers: { 'content-type': 'text/plain; charset=utf-8' } })
    }
    const rawMaster = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`, { next: { revalidate: 1800 } })
    if (rawMaster.ok) {
      const text = await rawMaster.text()
      return new NextResponse(text, { headers: { 'content-type': 'text/plain; charset=utf-8' } })
    }
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  } catch {
    return NextResponse.json({ error: 'error' }, { status: 500 })
  }
}


