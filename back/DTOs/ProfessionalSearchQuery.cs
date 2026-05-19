namespace MatchJob.DTOs;

public class ProfessionalSearchQuery
{
    public string? Search { get; set; }
    public string? Category { get; set; }
    public string? Location { get; set; }
    public string? Tag { get; set; }
    public double? MinRating { get; set; }
    public bool? Available { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 12;
}