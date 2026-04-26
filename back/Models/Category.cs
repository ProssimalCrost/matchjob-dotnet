namespace MatchJob.Models;

public class Category
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    // Category.cs
    public List<ProfessionalProfile> ProfessionalProfiles { get; set; } = new();
    public string Slug { get; set; } = string.Empty;
}
