using MatchJob.Models;

namespace MatchJob.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        await db.Database.EnsureCreatedAsync();

        Console.WriteLine("🌱 Seed: verificando dados iniciais...");

        if (!db.Users.Any(u => u.Email == "carlos@matchjob.com"))
        {
            var carlos = new User
            {
                Name     = "Carlos Silva",
                Email    = "carlos@matchjob.com",
                Password = BCrypt.Net.BCrypt.HashPassword("123456"),
                Role     = Role.PROFESSIONAL
            };
            db.Users.Add(carlos);
            await db.SaveChangesAsync();

            db.ProfessionalProfiles.Add(new ProfessionalProfile
            {
                UserId     = carlos.Id,
                Description = "Desenvolvedor full-stack com 5 anos de experiência.",
                Category   = "Desenvolvimento",
                Tags       = new List<string> { "React Native", ".NET", "PostgreSQL" },
                Location   = "São Paulo - SP",
                PriceRange = "R$80-R$150/hora",
                Rating     = 4.8
            });
            await db.SaveChangesAsync();
            Console.WriteLine("   ✔ Carlos inserido");
        }
        else { Console.WriteLine("   → Carlos já existe, pulando..."); }

        if (!db.Users.Any(u => u.Email == "ana@matchjob.com"))
        {
            var ana = new User
            {
                Name     = "Ana Ferreira",
                Email    = "ana@matchjob.com",
                Password = BCrypt.Net.BCrypt.HashPassword("123456"),
                Role     = Role.PROFESSIONAL
            };
            db.Users.Add(ana);
            await db.SaveChangesAsync();

            db.ProfessionalProfiles.Add(new ProfessionalProfile
            {
                UserId     = ana.Id,
                Description = "Designer UX/UI freelancer com foco em apps mobile.",
                Category   = "Design",
                Tags       = new List<string> { "UX/UI", "Figma", "Prototipação" },
                Location   = "Rio de Janeiro - RJ",
                PriceRange = "R$60-R$120/hora",
                Rating     = 4.9
            });
            await db.SaveChangesAsync();
            Console.WriteLine("   ✔ Ana inserida");
        }
        else { Console.WriteLine("   → Ana já existe, pulando..."); }

        if (!db.Users.Any(u => u.Email == "joao@matchjob.com"))
        {
            db.Users.Add(new User
            {
                Name     = "João Cliente",
                Email    = "joao@matchjob.com",
                Password = BCrypt.Net.BCrypt.HashPassword("123456"),
                Role     = Role.CLIENT
            });
            await db.SaveChangesAsync();
            Console.WriteLine("   ✔ João inserido");
        }
        else { Console.WriteLine("   → João já existe, pulando..."); }

        Console.WriteLine("✅ Seed concluído!");
        Console.WriteLine("   carlos@matchjob.com / 123456");
        Console.WriteLine("   ana@matchjob.com    / 123456");
        Console.WriteLine("   joao@matchjob.com   / 123456");
    }
}