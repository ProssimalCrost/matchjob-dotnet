namespace MatchJob.Models;

public class Tag
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public List<ProfessionalTag> ProfessionalTags { get; set; } = new();
    // Tag.cs
    public string Slug { get; set; } = string.Empty;
}
