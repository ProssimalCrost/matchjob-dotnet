namespace MatchJob.Models;

public class ProfessionalProfile
{
    public long Id { get; set; }

    public long UserId { get; set; }
    public User User { get; set; } = null!;

    public string? Description { get; set; }
    // ProfessionalProfile.cs
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public List<ProfessionalTag> ProfessionalTags { get; set; } = new();
    public string? Title { get; set; }
    public string? Bio { get; set; }
    public decimal? Price { get; set; }
    public bool Available { get; set; }
    public string? AvatarUrl { get; set; }

    public string? Location { get; set; }
    public string? PriceRange { get; set; }
    public double Rating { get; set; } = 0.0;
}
