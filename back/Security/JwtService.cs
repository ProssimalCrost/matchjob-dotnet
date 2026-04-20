// Security/JwtService.cs
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MatchJob.Models;
using Microsoft.IdentityModel.Tokens;

namespace MatchJob.Security;

/// <summary>
/// Gera e valida tokens JWT
/// </summary>
public class JwtService
{
    private readonly IConfiguration _config;

    public JwtService(IConfiguration config)
    {
        _config = config;
    }

    /// <summary>
    /// Gera um token JWT com o email do usuário como subject
    /// </summary>
    public string GenerateToken(User user)
    {
        var secret      = _config["Jwt:Secret"]!;
        var issuer      = _config["Jwt:Issuer"]!;
        var audience    = _config["Jwt:Audience"]!;
        var expHours    = int.Parse(_config["Jwt:ExpirationHours"] ?? "24");

        var key         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
        };

        var token = new JwtSecurityToken(
            issuer:             issuer,
            audience:           audience,
            claims:             claims,
            expires:            DateTime.UtcNow.AddHours(expHours),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
