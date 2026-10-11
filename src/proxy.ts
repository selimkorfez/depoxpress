import { NextResponse, type NextRequest } from 'next/server'

/** Visitors who chose Turkish before land on the Turkish home page. */
export function proxy(req: NextRequest) {
  if (req.cookies.get('NEXT_LOCALE')?.value === 'tr') {
    return NextResponse.redirect(new URL('/tr', req.url))
  }
  return NextResponse.next()
}

export const config = { matcher: ['/'] }
