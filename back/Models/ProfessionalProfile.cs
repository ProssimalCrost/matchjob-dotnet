// Models/ProfessionalProfile.cs
namespace MatchJob.Models;

public class ProfessionalProfile
{
    public long Id { get; set; }

    // FK para User
    public long UserId { get; set; }
    public User User { get; set; } = null!;

    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;

    // Tags armazenadas como JSON no PostgreSQL
    public List<string> Tags { get; set; } = new();

    public string? Location { get; set; }
    public string? PriceRange { get; set; }
    public double Rating { get; set; } = 0.0;
}
