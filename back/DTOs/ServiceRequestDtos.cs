using System.Text.Json.Serialization;
using MatchJob.Models;

namespace MatchJob.DTOs;

public record CreateServiceRequest(
    [property: JsonPropertyName("professionalId")] Guid ProfessionalId,
    [property: JsonPropertyName("title")] string Title,
    [property: JsonPropertyName("description")] string Description,
    [property: JsonPropertyName("categoryId")] Guid? CategoryId,
    [property: JsonPropertyName("scheduledDate")] DateTime? ScheduledDate,
    [property: JsonPropertyName("location")] string? Location
);

public record UpdateServiceRequestStatus(
    [property: JsonPropertyName("status")] ServiceRequestStatus Status
);

public record ServiceRequestResponse(
    [property: JsonPropertyName("id")] Guid Id,
    [property: JsonPropertyName("clientId")] Guid ClientId,
    [property: JsonPropertyName("clientName")] string ClientName,
    [property: JsonPropertyName("professionalId")] Guid ProfessionalId,
    [property: JsonPropertyName("professionalName")] string ProfessionalName,
    [property: JsonPropertyName("title")] string Title,
    [property: JsonPropertyName("description")] string Description,
    [property: JsonPropertyName("categoryId")] Guid? CategoryId,
    [property: JsonPropertyName("categoryName")] string? CategoryName,
    [property: JsonPropertyName("status")] ServiceRequestStatus Status,
    [property: JsonPropertyName("priceAgreed")] string? PriceAgreed,
    [property: JsonPropertyName("scheduledDate")] DateTime? ScheduledDate,
    [property: JsonPropertyName("location")] string? Location,
    [property: JsonPropertyName("createdAt")] DateTime CreatedAt,
    [property: JsonPropertyName("updatedAt")] DateTime UpdatedAt
);
