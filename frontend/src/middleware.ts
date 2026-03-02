import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { TOKENS } from './constants/tokens';
import { ROUTES_PATH } from './constants/route-path';
import { PUBLIC_ROUTES } from './constants/public-routes';

export function middleware(request: NextRequest) {
  const currentUrl = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const isPublicRoute = PUBLIC_ROUTES.includes(request.nextUrl.pathname);

  const hasAccessToken = request.cookies.has(TOKENS.ACCESS_TOKEN);
  const userRole = request.cookies.get(TOKENS.ROLE)?.value;

  if (isPublicRoute) {
    if (hasAccessToken) {
      // Redireciona baseado no role do usuário após login
      if (userRole === 'POS_VENDA') {
        return NextResponse.redirect(new URL('/after-sales', request.url));
      }
      const redirectTo = ROUTES_PATH.HOME;
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
  }

  if (!isPublicRoute) {
    // Bloqueia acesso de POS_VENDA à rota /home
    if (userRole === 'POS_VENDA' && request.nextUrl.pathname === '/home') {
      return NextResponse.redirect(new URL('/after-sales', request.url));
    }

    const response = NextResponse.next();
    response.cookies.set(ROUTES_PATH.CURRENT_URL, currentUrl);

    if (!hasAccessToken) {
      const redirect = NextResponse.redirect(new URL('/', request.url));
      redirect.cookies.set(ROUTES_PATH.CURRENT_URL, currentUrl);
      return redirect;
    }

    return response;
  }

  // Caso não se enquadre nas condições acima, segue normalmente
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};