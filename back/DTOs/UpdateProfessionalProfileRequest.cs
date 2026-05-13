namespace MatchJob.DTOs;

public class UpdateProfessionalProfileRequest
{
    public string Description { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public string Location { get; set; } = string.Empty;
    public string PriceRange { get; set; } = string.Empty;
    public List<Guid> TagIds { get; set; } = new();
}