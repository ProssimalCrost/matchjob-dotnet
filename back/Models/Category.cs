namespace MatchJob.Models;

public class Category
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Slug { get; set; }

    public ICollection<ProfessionalProfile> ProfessionalProfiles { get; set; } = new List<ProfessionalProfile>();

    public ICollection<CategoryTag> CategoryTags { get; set; } = new List<CategoryTag>();
}