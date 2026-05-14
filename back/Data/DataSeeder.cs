using MatchJob.Data;
using MatchJob.Models;
using Microsoft.EntityFrameworkCore;

namespace MatchJob.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        await db.Database.EnsureCreatedAsync();

        Console.WriteLine("🌱 Seed: verificando dados iniciais...");

        var categoriesWithTags = new Dictionary<string, string[]>
        {
            ["Desenvolvimento"] = new[]
    {
        "React",
        "Next.js",
        "Node.js",
        ".NET",
        "Spring Boot",
        "API",
        "Mobile",
        "Landing Page"
    },

            ["Design"] = new[]
    {
        "Figma",
        "UI Design",
        "UX Design",
        "Logo",
        "Identidade Visual",
        "Photoshop"
    },

            ["Elétrica"] = new[]
    {
        "Instalação",
        "Chuveiro",
        "Tomada",
        "Disjuntor",
        "Padrão de energia",
        "Manutenção elétrica"
    },

            ["Hidráulica"] = new[]
    {
        "Vazamento",
        "Encanamento",
        "Caixa d'água",
        "Desentupimento",
        "Torneira",
        "Registro"
    },

            ["Limpeza"] = new[]
    {
        "Diarista",
        "Faxina pesada",
        "Pós-obra",
        "Limpeza residencial",
        "Limpeza comercial"
    },

            ["Mecânica"] = new[]
    {
        "Carro",
        "Moto",
        "Troca de óleo",
        "Diagnóstico",
        "Freio",
        "Suspensão"
    },

            ["Reformas e Reparos"] = new[]
    {
        "Alvenaria",
        "Pintura",
        "Gesso",
        "Pisos e Revestimentos",
        "Telhadista",
        "Marido de Aluguel",
        "Montagem de Móveis",
        "Pedreiro"
    },

            ["Eventos"] = new[]
    {
        "Fotografia",
        "Filmagem",
        "DJ",
        "Buffet",
        "Decoração",
        "Segurança",
        "Garçom",
        "Cerimonialista"
    },

            ["Aulas e Consultoria"] = new[]
    {
        "Reforço Escolar",
        "Idiomas",
        "Música",
        "Consultoria Financeira",
        "Marketing Digital",
        "Treinamento Fitness",
        "Yoga"
    },

            ["Beleza e Estética"] = new[]
    {
        "Cabeleireiro",
        "Manicure e Pedicure",
        "Maquiagem",
        "Depilação",
        "Barbearia",
        "Massagem",
        "Estética Facial"
    },

            ["Saúde"] = new[]
    {
        "Fisioterapia",
        "Psicologia",
        "Nutrição",
        "Enfermagem",
        "Cuidador de Idosos",
        "Fonoaudiologia"
    },

            ["Pet"] = new[]
    {
        "Adestramento",
        "Banho e Tosa",
        "Passeador",
        "Dog Walker",
        "Pet Sitter",
        "Hospedagem Pet"
    },

            ["Moda e Costura"] = new[]
    {
        "Ajustes e Reformas",
        "Confecção Sob Medida",
        "Modelagem",
        "Bordado",
        "Artesanato"
    },

            ["Fretes e Mudanças"] = new[]
    {
        "Carreto",
        "Mudança Residencial",
        "Mudança Comercial",
        "Montagem e Desmontagem",
        "Transporte de Veículos"
    }
        };

        var categories = new Dictionary<string, Category>();

        foreach (var item in categoriesWithTags)
        {
            var categoryName = item.Key;
            var tagNames = item.Value;

            var category = await GetOrCreateCategoryAsync(
                db,
                categoryName,
                GenerateSlug(categoryName)
            );

            categories[categoryName] = category;

            await SeedCategoryTagsAsync(db, category, tagNames);
        }


        var carlos = await GetOrCreateUserAsync(
            db,
            name: "Carlos Silva",
            email: "carlos@matchjob.com",
            password: "123456",
            role: Role.PROFESSIONAL
        );

        var ana = await GetOrCreateUserAsync(
            db,
            name: "Ana Ferreira",
            email: "ana@matchjob.com",
            password: "123456",
            role: Role.PROFESSIONAL
        );

        var joao = await GetOrCreateUserAsync(
            db,
            name: "João Cliente",
            email: "joao@matchjob.com",
            password: "123456",
            role: Role.CLIENT
        );

        await GetOrCreateProfessionalProfileAsync(
            db,
            user: carlos,
            description: "Desenvolvedor full-stack com 5 anos de experiência em sistemas web, APIs e aplicações modernas.",
            category: categories["Desenvolvimento"],
            location: "São Paulo - SP",
            priceRange: "R$80-R$150/hora",
            rating: 4.8,
            tags: new[] { "React", "Node.js", ".NET", "API" }
        );

        await GetOrCreateProfessionalProfileAsync(
            db,
            user: ana,
            description: "Designer UX/UI freelancer com foco em aplicativos mobile, identidade visual e experiências digitais.",
            category: categories["Design"],
            location: "Rio de Janeiro - RJ",
            priceRange: "R$60-R$120/hora",
            rating: 4.9,
            tags: new[] { "Figma", "UI Design", "UX Design", "Identidade Visual" }
        );

        Console.WriteLine("✅ Seed concluído!");
        Console.WriteLine("   carlos@matchjob.com / 123456");
        Console.WriteLine("   ana@matchjob.com    / 123456");
        Console.WriteLine("   joao@matchjob.com   / 123456");
    }

    private static async Task<User> GetOrCreateUserAsync(
        AppDbContext db,
        string name,
        string email,
        string password,
        Role role)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user is not null)
        {
            Console.WriteLine($"   → Usuário {email} já existe, pulando...");
            return user;
        }

        user = new User
        {
            Name = name,
            Email = email,
            Password = BCrypt.Net.BCrypt.HashPassword(password),
            Role = role
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        Console.WriteLine($"   ✔ Usuário {email} inserido");

        return user;
    }

    private static async Task<Category> GetOrCreateCategoryAsync(
        AppDbContext db,
        string name,
        string slug)
    {
        var category = await db.Categories
            .FirstOrDefaultAsync(c => c.Slug == slug);

        if (category is not null)
            return category;

        category = new Category
        {
            Name = name,
            Slug = slug
        };

        db.Categories.Add(category);
        await db.SaveChangesAsync();

        Console.WriteLine($"   ✔ Categoria {name} inserida");

        return category;
    }

    private static async Task<Tag> GetOrCreateTagAsync(
        AppDbContext db,
        string name)
    {
        var slug = GenerateSlug(name);

        var tag = await db.Tags
            .FirstOrDefaultAsync(t => t.Slug == slug);

        if (tag is not null)
            return tag;

        tag = new Tag
        {
            Name = name,
            Slug = slug
        };

        db.Tags.Add(tag);
        await db.SaveChangesAsync();

        Console.WriteLine($"   ✔ Tag {name} inserida");

        return tag;
    }

    private static async Task SeedCategoryTagsAsync(
        AppDbContext db,
        Category category,
        IEnumerable<string> tagNames)
    {
        foreach (var tagName in tagNames)
        {
            var tag = await GetOrCreateTagAsync(db, tagName);

            var relationExists = await db.CategoryTags.AnyAsync(ct =>
                ct.CategoryId == category.Id &&
                ct.TagId == tag.Id
            );

            if (relationExists)
                continue;

            db.CategoryTags.Add(new CategoryTag
            {
                CategoryId = category.Id,
                TagId = tag.Id
            });

            Console.WriteLine($"   ✔ Relação criada: {category.Name} -> {tag.Name}");
        }

        await db.SaveChangesAsync();
    }

    private static async Task GetOrCreateProfessionalProfileAsync(
        AppDbContext db,
        User user,
        string description,
        Category category,
        string location,
        string priceRange,
        double rating,
        IEnumerable<string> tags)
    {
        var profile = await db.ProfessionalProfiles
            .Include(p => p.ProfessionalTags)
            .FirstOrDefaultAsync(p => p.UserId == user.Id);

        if (profile is not null)
        {
            Console.WriteLine($"   → Perfil profissional de {user.Email} já existe, atualizando dados...");

            profile.Description = description;
            profile.Category = category;
            profile.Location = location;
            profile.PriceRange = priceRange;
            profile.Rating = rating;

            await SyncProfessionalTagsAsync(db, profile, tags);

            await db.SaveChangesAsync();
            return;
        }

        profile = new ProfessionalProfile
        {
            UserId = user.Id,
            Description = description,
            Category = category,
            Location = location,
            PriceRange = priceRange,
            Rating = rating
        };

        db.ProfessionalProfiles.Add(profile);
        await db.SaveChangesAsync();

        await SyncProfessionalTagsAsync(db, profile, tags);

        await db.SaveChangesAsync();

        Console.WriteLine($"   ✔ Perfil profissional criado para {user.Email}");
    }

    private static async Task SyncProfessionalTagsAsync(
        AppDbContext db,
        ProfessionalProfile profile,
        IEnumerable<string> tagNames)
    {
        await db.Entry(profile)
            .Collection(p => p.ProfessionalTags)
            .LoadAsync();

        profile.ProfessionalTags.Clear();

        foreach (var tagName in tagNames)
        {
            var tag = await GetOrCreateTagAsync(db, tagName);

            profile.ProfessionalTags.Add(new ProfessionalTag
            {
                ProfessionalId = profile.Id,
                TagId = tag.Id
            });
        }
    }

    private static string GenerateSlug(string value)
    {
        return value
            .Trim()
            .ToLower()
            .Replace(" ", "-")
            .Replace(".", "")
            .Replace(",", "")
            .Replace("/", "-")
            .Replace("ç", "c")
            .Replace("ã", "a")
            .Replace("á", "a")
            .Replace("à", "a")
            .Replace("â", "a")
            .Replace("é", "e")
            .Replace("ê", "e")
            .Replace("í", "i")
            .Replace("ó", "o")
            .Replace("ô", "o")
            .Replace("õ", "o")
            .Replace("ú", "u");
    }
}
