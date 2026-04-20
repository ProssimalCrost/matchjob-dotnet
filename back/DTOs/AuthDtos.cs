// DTOs/AuthDtos.cs
using MatchJob.Models;

namespace MatchJob.DTOs;

public record RegisterRequest(
    string Name,
    string Email,
    string Password,
    Role Role
);

public record LoginRequest(
    string Email,
    string Password
);

public record AuthResponse(
    string Token,
    long UserId,
    string Name,
    string Email,
    Role Role
);
