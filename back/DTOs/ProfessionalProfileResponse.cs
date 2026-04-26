

public record ProfessionalProfileResponse(
    long Id,
    string Name,
    string Description,
    string Category,
    string? Location,
    string? PriceRange,
    double Rating
);