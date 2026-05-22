// migrate-users.ts
// Rode com: npx ts-node migrate-users.ts
import { createClient } from "@supabase/supabase-js";
import { Pool } from "pg";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service_role, nunca o anon key
);

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  const { rows: users } = await db.query(
    `SELECT "Id", "Name", "Email", "Password" FROM users`
  );

  console.log(`Migrando ${users.length} usuários...`);

  for (const user of users) {
    // Supabase aceita o hash bcrypt diretamente — não precisa da senha em texto
    const { error } = await supabase.auth.admin.createUser({
      email: user.Email,
      email_confirm: true,
      user_metadata: { full_name: user.Name },
      password_hash: user.Password, // hash bcrypt existente
    });

    if (error) {
      // Usuário já existe no Supabase (ex: criado pelo Google)
      if (error.message.includes("already been registered")) {
        console.log(`⚠️  Já existe: ${user.Email}`);
      } else {
        console.error(`❌ Erro em ${user.Email}:`, error.message);
      }
    } else {
      console.log(`✅ Migrado: ${user.Email}`);
    }
  }

  await db.end();
  console.log("Migração concluída.");
}

migrate();