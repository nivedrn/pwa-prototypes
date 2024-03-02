import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from './lib/auth'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const path = request.nextUrl.pathname

  const isPublicPath = path === '/auth' 

  const token: any = request.cookies.get("session")?.value;
  if(isPublicPath && token) {
    return NextResponse.redirect(new URL('/', request.nextUrl))
  }

  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/auth?returnUrl=' + path, request.nextUrl))
  }

  return res
}

// It specifies the paths for which this middleware should be executed. 
export const config = {
  matcher: [
    '/profile',
    '/auth',
    '/checkout'
  ]
}