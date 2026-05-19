import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/professionals";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (error) {
    console.error("[auth/callback] OAuth error:", error, errorDescription);
    const params = new URLSearchParams({
      error: errorDescription ?? error,
    });
    return NextResponse.redirect(`${origin}/login?${params}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error("[auth/callback] Code exchange failed:", exchangeError.message);
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`);
  }

  // Check whether the user already has a professional profile.
  // 404 → first login, send to /profile/setup.
  // Any other outcome → proceed to intended destination.
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
      const profileRes = await fetch(`${apiUrl}/professionals/me`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (profileRes.status === 404) {
        return NextResponse.redirect(`${origin}/profile/setup`);
      }
    }
  } catch {
    // API unreachable — fall through to default redirect
  }

  return NextResponse.redirect(`${origin}${next}`);
}
