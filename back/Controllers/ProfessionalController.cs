// Controllers/ProfessionalController.cs
using System.Security.Claims;
using MatchJob.DTOs;
using MatchJob.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MatchJob.Controllers;

[ApiController]
[Route("professionals")]
public class ProfessionalController : ControllerBase
{
    private readonly ProfessionalProfileService _service;

    public ProfessionalController(ProfessionalProfileService service)
    {
        _service = service;
    }

    /// GET /professionals
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> List([FromQuery] ProfessionalSearchQuery filters)
    {
        var result = await _service.ListAsync(filters);
        return Ok(result);
    }

    /// GET /professionals/me
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMe()
    {
        try
        {
            var userId = GetUserIdFromToken();
            var result = await _service.GetByUserIdAsync(userId);

            if (result == null)
                return NotFound(new { message = "Perfil profissional não encontrado." });

            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    /// POST /professionals/me — cria perfil para o usuário autenticado
    [HttpPost("me")]
    [Authorize]
    public async Task<IActionResult> CreateMe([FromBody] CreateMyProfileRequest request)
    {
        try
        {
            var userId = GetUserIdFromToken();
            var result = await _service.CreateForMeAsync(userId, request);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// PUT /professionals/me
    [HttpPut("me")]
    [Authorize]
    public async Task<IActionResult> UpdateMe([FromBody] UpdateProfessionalProfileRequest request)
    {
        try
        {
            var userId = GetUserIdFromToken();
            var result = await _service.UpdateByUserIdAsync(userId, request);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// GET /professionals/{id}
    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var result = await _service.GetByIdAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// POST /professionals — mantido para compatibilidade
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromQuery] Guid userId, [FromBody] ProfessionalProfileRequest req)
    {
        try
        {
            await _service.CreateAsync(userId, req);
            return Ok(new { message = "Perfil profissional criado com sucesso." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private Guid GetUserIdFromToken()
    {
        var claim =
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
            User.FindFirst("sub")?.Value ??
            User.FindFirst("id")?.Value ??
            User.FindFirst("userId")?.Value;

        if (string.IsNullOrWhiteSpace(claim))
            throw new UnauthorizedAccessException("Usuário não autenticado ou token inválido.");

        if (!Guid.TryParse(claim, out var userId))
            throw new UnauthorizedAccessException("Id do usuário no token é inválido.");

        return userId;
    }
}
