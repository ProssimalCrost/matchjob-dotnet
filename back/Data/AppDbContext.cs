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
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<ProfessionalTag> ProfessionalTags => Set<ProfessionalTag>();
    public DbSet<UserSettings> UserSettings => Set<UserSettings>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<CategoryTag> CategoryTags => Set<CategoryTag>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("users");

            e.HasIndex(u => u.Email)
                .IsUnique();

            e.Property(u => u.Role)
                .HasConversion<string>();
        });

        modelBuilder.Entity<ProfessionalProfile>(e =>
        {
            e.ToTable("professional_profiles");

            e.HasOne(p => p.User)
                .WithOne(u => u.ProfessionalProfile)
                .HasForeignKey<ProfessionalProfile>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasIndex(p => p.UserId)
                .IsUnique();

            e.HasOne(p => p.Category)
                .WithMany(c => c.ProfessionalProfiles)
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Conversation>(e =>
        {
            e.ToTable("conversations");

            e.HasIndex(c => new { c.ClientId, c.ProfessionalId })
                .IsUnique();

            e.HasOne(c => c.Client)
                .WithMany()
                .HasForeignKey(c => c.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(c => c.Professional)
                .WithMany()
                .HasForeignKey(c => c.ProfessionalId)
                .OnDelete(DeleteBehavior.Restrict);
        });

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

        modelBuilder.Entity<Category>(e =>
        {
            e.ToTable("categories");

            e.HasIndex(c => c.Name)
                .IsUnique();

            e.HasIndex(c => c.Slug)
                .IsUnique();
        });

        modelBuilder.Entity<Tag>(e =>
        {
            e.ToTable("tags");

            e.HasIndex(t => t.Name)
                .IsUnique();

            e.HasIndex(t => t.Slug)
                .IsUnique();
        });

        modelBuilder.Entity<ProfessionalTag>(e =>
        {
            e.ToTable("professional_tags");

            e.HasKey(pt => new { pt.ProfessionalId, pt.TagId });

            e.HasOne(pt => pt.Professional)
                .WithMany(p => p.ProfessionalTags)
                .HasForeignKey(pt => pt.ProfessionalId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(pt => pt.Tag)
                .WithMany(t => t.ProfessionalTags)
                .HasForeignKey(pt => pt.TagId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<UserSettings>(e =>
        {
            e.ToTable("user_settings");

            e.HasIndex(s => s.UserId)
                .IsUnique();

            e.HasOne(s => s.User)
                .WithOne(u => u.Settings)
                .HasForeignKey<UserSettings>(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Review>()
            .HasOne(r => r.Reviewer)
            .WithMany()
            .HasForeignKey(r => r.ReviewerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Review>()
            .HasOne(r => r.ProfessionalProfile)
            .WithMany()
            .HasForeignKey(r => r.ProfessionalProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Review>()
            .HasIndex(r => new { r.ReviewerId, r.ProfessionalProfileId })
            .IsUnique();

        modelBuilder.Entity<CategoryTag>()
             .HasKey(ct => new { ct.CategoryId, ct.TagId });

        modelBuilder.Entity<CategoryTag>()
            .HasOne(ct => ct.Category)
            .WithMany(c => c.CategoryTags)
            .HasForeignKey(ct => ct.CategoryId);

        modelBuilder.Entity<CategoryTag>()
            .HasOne(ct => ct.Tag)
            .WithMany(t => t.CategoryTags)
            .HasForeignKey(ct => ct.TagId);
    }
}