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
    const params = new URLSearchParams({ error: errorDescription ?? error });
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

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.redirect(`${origin}/login?error=no_session`);
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
  const authHeader = { Authorization: `Bearer ${session.access_token}` };

  // Sincroniza o usuário Supabase com a tabela local (cria se não existir)
  try {
    const syncRes = await fetch(`${apiUrl}/auth/sync-user`, {
      method: "POST",
      headers: { ...authHeader, "Content-Type": "application/json" },
    });

    if (!syncRes.ok) {
      console.error("[auth/callback] sync-user falhou:", syncRes.status, await syncRes.text());
    }
  } catch (err) {
    console.error("[auth/callback] sync-user erro de rede:", err);
  }

  // Decide o destino: se já tem perfil profissional → /professionals; senão → /profile/setup
  try {
    const profileRes = await fetch(`${apiUrl}/professionals/me`, {
      headers: authHeader,
    });

    if (profileRes.status === 404) {
      return NextResponse.redirect(`${origin}/profile/setup`);
    }

    if (profileRes.ok) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  } catch {
    // API inacessível — redireciona para o destino padrão
  }

  return NextResponse.redirect(`${origin}${next}`);
}
