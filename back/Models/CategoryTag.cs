namespace MatchJob.Models;

public class CategoryTag
{
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    public Guid TagId { get; set; }
    public Tag Tag { get; set; } = null!;
}