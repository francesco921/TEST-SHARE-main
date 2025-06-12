import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()
  const domain = req.headers.get('host') || ''

  url.searchParams.set('domain', domain)
  return NextResponse.rewrite(url)
}
