// Controllers/AuthController.cs
using System.Security.Claims;
using MatchJob.DTOs;
using MatchJob.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MatchJob.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService) => _authService = authService;

    /// POST /auth/sync-user
    /// Cria ou atualiza o usuário local com base no JWT Supabase.
    /// Deve ser chamado após qualquer login ou cadastro bem-sucedido no Supabase.
    [HttpPost("sync-user")]
    [Authorize]
    public async Task<IActionResult> SyncUser()
    {
        var (sub, email, name) = ExtractClaims();
        if (sub == null || email == null)
            return Unauthorized(new { message = "Token inválido." });

        var result = await _authService.SyncUserAsync(sub, email, name!);
        return Ok(result);
    }

    /// GET /auth/me — alias de sync-user, mantido por compatibilidade
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var (sub, email, name) = ExtractClaims();
        if (sub == null || email == null)
            return Unauthorized(new { message = "Token inválido." });

        var result = await _authService.SyncUserAsync(sub, email, name!);
        return Ok(result);
    }

    /// POST /auth/register — mantido para compatibilidade; frontend usa Supabase diretamente
   /* [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        try
        {
            var result = await _authService.RegisterAsync(req);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    } */

    /// POST /auth/login — mantido para compatibilidade; frontend usa Supabase diretamente
  /*  [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        try
        {
            var result = await _authService.LoginAsync(req);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }*/

    // ─── Privado ─────────────────────────────────────────────────────────────

    private (string? sub, string? email, string? name) ExtractClaims()
    {
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
               ?? User.FindFirst("sub")?.Value;

        var email = User.FindFirst(ClaimTypes.Email)?.Value
                 ?? User.FindFirst("email")?.Value;

        var name = User.FindFirst(ClaimTypes.Name)?.Value
                ?? User.FindFirst("name")?.Value
                ?? User.FindFirst("full_name")?.Value
                ?? email?.Split('@')[0];

        return (sub, email, name);
    }
}
