// DTOs/AuthDtos.cs
using MatchJob.Models;

namespace MatchJob.DTOs;

public record RegisterRequest(
    string Name,
    string Email,
    string Password,
    Role Role = Role.CLIENT
);

public record LoginRequest(
    string Email,
    string Password
);

public record AuthResponse(
    string Token,
    Guid UserId,
    string Name,
    string Email,
    Role Role
);
