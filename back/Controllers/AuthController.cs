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

    /// POST /auth/register
    [HttpPost("register")]
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
    }

    /// POST /auth/login
    [HttpPost("login")]
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
    }

    /// GET /auth/me — retorna dados do usuário autenticado
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var claim =
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
            User.FindFirst("sub")?.Value;

        if (!Guid.TryParse(claim, out var userId))
            return Unauthorized(new { message = "Token inválido." });

        var result = await _authService.GetMeAsync(userId);

        if (result == null)
            return NotFound(new { message = "Usuário não encontrado." });

        return Ok(result);
    }
}
