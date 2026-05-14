namespace MatchJob.Models;

public class Tag
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Slug { get; set; }

    public ICollection<ProfessionalTag> ProfessionalTags { get; set; } = new List<ProfessionalTag>();

    public ICollection<CategoryTag> CategoryTags { get; set; } = new List<CategoryTag>();
}