import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 2 hours — must match SessionTimeout component
const SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000;
const LAST_ACTIVE_COOKIE = "admin_last_active";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";

  // Login page is always accessible — never redirect from it
  if (!isAdminRoute || isLoginPage) {
    return response;
  }

  // Not logged in → login page
  if (!user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Server-side idle timeout — works without Supabase JWT config
  const lastActive = request.cookies.get(LAST_ACTIVE_COOKIE)?.value;
  const now = Date.now();

  if (lastActive) {
    const elapsed = now - parseInt(lastActive, 10);
    if (elapsed > SESSION_TIMEOUT_MS) {
      // Expired — clear session and send to login
      const loginUrl = new URL("/admin/login", request.url);
      const expiredResponse = NextResponse.redirect(loginUrl);

      // Clear all sb- cookies and our tracking cookie
      request.cookies.getAll().forEach((cookie) => {
        if (cookie.name.startsWith("sb-")) {
          expiredResponse.cookies.delete(cookie.name);
        }
      });
      expiredResponse.cookies.delete(LAST_ACTIVE_COOKIE);

      return expiredResponse;
    }
  }

  // Stamp last active time on every admin request
  response.cookies.set(LAST_ACTIVE_COOKIE, String(now), {
    httpOnly: true,
    sameSite: "lax",
    path: "/admin",
    maxAge: SESSION_TIMEOUT_MS / 1000,
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};