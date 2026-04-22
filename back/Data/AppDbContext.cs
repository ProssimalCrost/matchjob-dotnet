// Data/AppDbContext.cs
using MatchJob.Models;
using Microsoft.EntityFrameworkCore;

namespace MatchJob.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<ProfessionalProfile> ProfessionalProfiles => Set<ProfessionalProfile>();
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<Message> Messages => Set<Message>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ── User ──────────────────────────────────────────────────
        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("users");
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Role).HasConversion<string>(); // Salva como texto
        });

        // ── ProfessionalProfile ───────────────────────────────────
        modelBuilder.Entity<ProfessionalProfile>(e =>
        {
            e.ToTable("professional_profiles");

            // Tags como coluna JSON nativa do PostgreSQL
            e.Property(p => p.Tags)
            .HasColumnType("text")
            .HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new List<string>()
            )
            .HasDefaultValue(new List<string>());

            // Relação 1:1 com User
            e.HasOne(p => p.User)
             .WithOne(u => u.ProfessionalProfile)
             .HasForeignKey<ProfessionalProfile>(p => p.UserId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasIndex(p => p.UserId).IsUnique();
        });

        // ── Conversation ──────────────────────────────────────────
        modelBuilder.Entity<Conversation>(e =>
        {
            e.ToTable("conversations");

            // Um cliente não pode ter 2 conversas com o mesmo profissional
            e.HasIndex(c => new { c.ClientId, c.ProfessionalId }).IsUnique();

            e.HasOne(c => c.Client)
             .WithMany()
             .HasForeignKey(c => c.ClientId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(c => c.Professional)
             .WithMany()
             .HasForeignKey(c => c.ProfessionalId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Message ───────────────────────────────────────────────
        modelBuilder.Entity<Message>(e =>
        {
            e.ToTable("messages");

            e.HasOne(m => m.Conversation)
             .WithMany(c => c.Messages)
             .HasForeignKey(m => m.ConversationId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(m => m.Sender)
             .WithMany()
             .HasForeignKey(m => m.SenderId)
             .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
