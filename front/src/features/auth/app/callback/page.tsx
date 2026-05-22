"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/shared/lib/supabaseClient";
import { setToken } from "@/src/shared/utils/token";
import { getMe } from "@/src/features/auth/services/authService";
import { getMyProfessionalProfile } from "@/src/features/professionals/services/professionalService";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        console.error("Erro no callback:", error?.message);
        router.push("/login");
        return;
      }

      // Persiste o token Supabase para as chamadas ao backend
      setToken(data.session.access_token);

      // Garante que o usuário local existe no banco (cria se necessário)
      try {
        await getMe();
      } catch {
        // Se /auth/me falhar, continua mesmo assim
      }

      // Redireciona conforme existência de perfil profissional
      try {
        await getMyProfessionalProfile();
        router.push("/professionals");
      } catch {
        router.push("/profile/setup");
      }
    }

    handleCallback();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <p>Finalizando login...</p>
    </main>
  );
}
