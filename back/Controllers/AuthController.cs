// Controllers/AuthController.cs
using MatchJob.DTOs;
using MatchJob.Services;
using Microsoft.AspNetCore.Mvc;

namespace MatchJob.Controllers;

/// <summary>
/// Endpoints de autenticação — públicos (não requerem JWT)
/// </summary>
[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService) => _authService = authService;

    /// <summary>
    /// POST /auth/register
    /// Body: { "name": "...", "email": "...", "password": "...", "role": "CLIENT" }
    /// </summary>
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

    /// <summary>
    /// POST /auth/login
    /// Body: { "email": "...", "password": "..." }
    /// </summary>
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
}
