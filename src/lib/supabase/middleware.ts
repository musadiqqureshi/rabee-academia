import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ROLE_HOME, type UserRole } from "./types";

type CookieToSet = { name: string; value: string; options: CookieOptions };

const PROTECTED_PREFIXES = ["/dashboard"];
const AUTH_ROUTES = ["/login", "/register"];

export async function updateSession(request: NextRequest) {
  const passthrough = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return passthrough;

  try {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;
    const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
    const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p));

    if (isProtected && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectedFrom", pathname);
      return NextResponse.redirect(url);
    }

    if (isAuthRoute && user) {
      const role = (user.app_metadata?.role ??
        user.user_metadata?.role) as UserRole | undefined;
      const url = request.nextUrl.clone();
      url.pathname = role ? ROLE_HOME[role] : "/dashboard/student";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch {
    // If anything in the Supabase auth check throws (e.g. Edge runtime
    // compatibility issue, network error), serve the request normally so
    // the site stays up.
    return passthrough;
  }
}
