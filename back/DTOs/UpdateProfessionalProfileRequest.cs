namespace MatchJob.DTOs;

public class CreateMyProfileRequest
{
    public string? Title { get; set; }
    public string? Bio { get; set; }
    public string? Description { get; set; }
    public Guid CategoryId { get; set; }
    public List<Guid> TagIds { get; set; } = new();
    public string? Location { get; set; }
    public string? PriceRange { get; set; }
    public decimal? Price { get; set; }
    public string? AvatarUrl { get; set; }
    public bool Available { get; set; } = true;
}

public class UpdateProfessionalProfileRequest
{
    public string? Title { get; set; }
    public string? Bio { get; set; }
    public string? Description { get; set; }
    public Guid CategoryId { get; set; }
    public string? Location { get; set; }
    public string? PriceRange { get; set; }
    public decimal? Price { get; set; }
    public string? AvatarUrl { get; set; }
    public bool Available { get; set; } = true;
    public List<Guid> TagIds { get; set; } = new();
}