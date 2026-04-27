// DTOs/ProfessionalDtos.cs
namespace MatchJob.DTOs;

public record ProfessionalProfileRequest(
    string? Description,
    string Category,
    List<string> Tags,
    string? Location,
    string? PriceRange
);

// DTOs/ConversationDtos.cs
public record ConversationRequest(
    Guid ClientId,
    Guid ProfessionalId
);

public record ConversationResponse(
    Guid Id,
    Guid ClientId,
    string ClientName,
    Guid ProfessionalId,
    string ProfessionalName
);

// DTOs/MessageDtos.cs
public record MessageRequest(
    Guid ConversationId,
    Guid SenderId,
    string Content
);

public record MessageResponse(
    Guid Id,
    Guid ConversationId,
    Guid SenderId,
    string SenderName,
    string Content,
    DateTime CreatedAt
);
