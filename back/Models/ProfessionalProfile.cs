namespace MatchJob.Models;

public class ProfessionalProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public List<ProfessionalTag> ProfessionalTags { get; set; } = new();

    public string? Title { get; set; }
    public string? Bio { get; set; }
    public string? Description { get; set; }
    public decimal? Price { get; set; }
    public string? AvatarUrl { get; set; }
    public bool Available { get; set; } = true;

    public string? Location { get; set; }
    public string? PriceRange { get; set; }
    public double Rating { get; set; } = 0.0;
    public int ReviewCount { get; set; } = 0;
}
