namespace MatchJob.DTOs;

public record ProfessionalProfileResponse(
    Guid Id,
    Guid UserId,
    string UserName,
    string UserEmail,
    string? Description,
    string Category,
    List<string> Tags,
    string? Location,
    string? PriceRange,
    double Rating
);
