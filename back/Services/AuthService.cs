// Services/AuthService.cs
using MatchJob.Data;
using MatchJob.DTOs;
using MatchJob.Models;
using MatchJob.Security;
using Microsoft.EntityFrameworkCore;

namespace MatchJob.Services;

public class AuthService
{
    private readonly AppDbContext _db;
    private readonly JwtService _jwt;

    public AuthService(AppDbContext db, JwtService jwt)
    {
        _db  = db;
        _jwt = jwt;
    }

    /// <summary>
    /// Cadastra novo usuário e retorna token JWT imediatamente
    /// </summary>
    public async Task<AuthResponse> RegisterAsync(RegisterRequest req)
    {
        // Verifica email duplicado
        if (await _db.Users.AnyAsync(u => u.Email == req.Email))
            throw new InvalidOperationException($"Email já cadastrado: {req.Email}");

        var user = new User
        {
            Name     = req.Name,
            Email    = req.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(req.Password),
            Role     = req.Role
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return BuildResponse(user);
    }

    /// <summary>
    /// Autentica usuário e retorna token JWT
    /// </summary>
    public async Task<AuthResponse> LoginAsync(LoginRequest req)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == req.Email)
            ?? throw new UnauthorizedAccessException("Email ou senha incorretos");

        // Verifica senha com BCrypt
        if (!BCrypt.Net.BCrypt.Verify(req.Password, user.Password))
            throw new UnauthorizedAccessException("Email ou senha incorretos");

        return BuildResponse(user);
    }

    public async Task<AuthResponse?> GetMeAsync(Guid userId)
    {
        var user = await _db.Users.FindAsync(userId);
        return user == null ? null : BuildResponse(user);
    }

    private AuthResponse BuildResponse(User user) =>
        new(
            Token:  _jwt.GenerateToken(user),
            UserId: user.Id,
            Name:   user.Name,
            Email:  user.Email,
            Role:   user.Role
        );
}
