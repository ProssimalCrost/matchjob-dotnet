// DTOs/ProfessionalDtos.cs
namespace MatchJob.DTOs;

public record ProfessionalProfileRequest(
    string? Description,
    string Category,
    List<string> Tags,
    string? Location,
    string? PriceRange
);

public record ProfessionalProfileResponse(
    long Id,
    long UserId,
    string UserName,
    string UserEmail,
    string? Description,
    string Category,
    List<string> Tags,
    string? Location,
    string? PriceRange,
    double Rating
);

// DTOs/ConversationDtos.cs
public record ConversationRequest(
    long ClientId,
    long ProfessionalId
);

public record ConversationResponse(
    long Id,
    long ClientId,
    string ClientName,
    long ProfessionalId,
    string ProfessionalName
);

// DTOs/MessageDtos.cs
public record MessageRequest(
    long ConversationId,
    long SenderId,
    string Content
);

public record MessageResponse(
    long Id,
    long ConversationId,
    long SenderId,
    string SenderName,
    string Content,
    DateTime CreatedAt
);
