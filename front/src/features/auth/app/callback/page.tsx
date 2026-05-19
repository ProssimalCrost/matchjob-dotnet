"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/shared/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Erro no callback:", error.message);
        router.push("/login");
        return;
      }

      if (data.session) {
        router.push("/profile");
        return;
      }

      router.push("/login");
    }

    handleCallback();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <p>Finalizando login...</p>
    </main>
  );
}