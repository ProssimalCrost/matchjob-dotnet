namespace MatchJob.DTOs;

public record ProfessionalProfileResponse(
    Guid Id,
    Guid UserId,
    string UserName,
    string UserEmail,
    string? Title,
    string? Bio,
    string? Description,
    Guid CategoryId,
    string Category,
    List<TagDto> Tags,
    string? Location,
    string? PriceRange,
    decimal? Price,
    string? AvatarUrl,
    bool Available,
    double Rating,
    int ReviewCount
);

public record TagDto(Guid Id, string Name, string? Slug);
