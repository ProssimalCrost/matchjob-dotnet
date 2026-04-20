// Data/DataSeeder.cs
using MatchJob.Models;
using BCrypt.Net;

namespace MatchJob.Data;

/// <summary>
/// Popula o banco com dados iniciais na primeira execução.
/// Só insere se não houver usuários cadastrados.
/// </summary>
public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        // Garante que as tabelas existam (cria se necessário)
        await db.Database.EnsureCreatedAsync();

        // Só faz seed se o banco estiver vazio
        if (db.Users.Any()) return;

        Console.WriteLine("🌱 Seed: populando banco com dados iniciais...");

        // ── Profissional 1: Dev ───────────────────────────────────
        var carlosUser = new User
        {
            Name = "Carlos Silva",
            Email = "carlos@matchjob.com",
            Password = BCrypt.Net.BCrypt.HashPassword("123456"),
            Role = Role.PROFESSIONAL
        };
        db.Users.Add(carlosUser);
        await db.SaveChangesAsync();

        db.ProfessionalProfiles.Add(new ProfessionalProfile
        {
            UserId = carlosUser.Id,
            Description = "Desenvolvedor full-stack com 5 anos de experiência. " +
                          "Especialista em React Native e .NET. " +
                          "Atendo projetos de apps mobile, sistemas web e APIs REST.",
            Category = "Desenvolvimento",
            Tags = ["React Native", ".NET", "PostgreSQL", "Node.js", "AWS"],
            Location = "São Paulo - SP",
            PriceRange = "R$80-R$150/hora",
            Rating = 4.8
        });

        // ── Profissional 2: Designer ──────────────────────────────
        var anaUser = new User
        {
            Name = "Ana Ferreira",
            Email = "ana@matchjob.com",
            Password = BCrypt.Net.BCrypt.HashPassword("123456"),
            Role = Role.PROFESSIONAL
        };
        db.Users.Add(anaUser);
        await db.SaveChangesAsync();

        db.ProfessionalProfiles.Add(new ProfessionalProfile
        {
            UserId = anaUser.Id,
            Description = "Designer UX/UI freelancer com foco em apps mobile e sistemas web. " +
                          "Trabalho com Figma, crio protótipos interativos e design systems completos.",
            Category = "Design",
            Tags = ["UX/UI", "Figma", "Prototipação", "Design System", "Branding"],
            Location = "Rio de Janeiro - RJ",
            PriceRange = "R$60-R$120/hora",
            Rating = 4.9
        });

        // ── Cliente de teste ──────────────────────────────────────
        db.Users.Add(new User
        {
            Name = "João Cliente",
            Email = "joao@matchjob.com",
            Password = BCrypt.Net.BCrypt.HashPassword("123456"),
            Role = Role.CLIENT
        });

        await db.SaveChangesAsync();

        Console.WriteLine("✅ Seed concluído!");
        Console.WriteLine("   Profissional: carlos@matchjob.com / 123456");
        Console.WriteLine("   Profissional: ana@matchjob.com    / 123456");
        Console.WriteLine("   Cliente:      joao@matchjob.com   / 123456");
    }
}
