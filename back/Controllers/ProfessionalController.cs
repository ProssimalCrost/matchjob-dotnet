// Controllers/ProfessionalController.cs
using System.Security.Claims;
using MatchJob.DTOs;
using MatchJob.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MatchJob.Controllers;

/// <summary>
/// Endpoints de profissionais
/// </summary>
[ApiController]
[Route("professionals")]
public class ProfessionalController : ControllerBase
{
    private readonly ProfessionalProfileService _service;

    public ProfessionalController(ProfessionalProfileService service)
    {
        _service = service;
    }

    /// <summary>
    /// GET /professionals
    /// GET /professionals?search=dev
    /// GET /professionals?category=Design
    /// GET /professionals?location=São Paulo
    /// GET /professionals?tag=Figma
    /// GET /professionals?minRating=4&page=1&pageSize=12
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> List([FromQuery] ProfessionalSearchQuery filters)
    {
        var result = await _service.ListAsync(filters);
        return Ok(result);
    }

    /// <summary>
    /// GET /professionals/me
    /// Retorna o perfil profissional do usuário autenticado
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMe()
    {
        try
        {
            var userId = GetUserIdFromToken();

            var result = await _service.GetByUserIdAsync(userId);

            if (result == null)
            {
                return NotFound(new
                {
                    message = "Perfil profissional não encontrado."
                });
            }

            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new
            {
                message = ex.Message
            });
        }
    }

    /// <summary>
    /// PUT /professionals/me
    /// Atualiza o perfil profissional do usuário autenticado
    /// </summary>
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
            return Unauthorized(new
            {
                message = ex.Message
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    /// <summary>
    /// GET /professionals/{id}
    /// </summary>
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
            return NotFound(new
            {
                message = ex.Message
            });
        }
    }

    /// <summary>
    /// POST /professionals?userId={guid}
    /// Cria um perfil profissional para um usuário
    /// </summary>
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create(
        [FromQuery] Guid userId,
        [FromBody] ProfessionalProfileRequest req)
    {
        try
        {
            await _service.CreateAsync(userId, req);

            return Ok(new
            {
                message = "Perfil profissional criado com sucesso."
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    private Guid GetUserIdFromToken()
    {
        var userIdClaim =
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
            User.FindFirst("sub")?.Value ??
            User.FindFirst("id")?.Value ??
            User.FindFirst("userId")?.Value;

        if (string.IsNullOrWhiteSpace(userIdClaim))
        {
            throw new UnauthorizedAccessException(
                "Usuário não autenticado ou token inválido."
            );
        }

        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException(
                "Id do usuário no token é inválido."
            );
        }

        return userId;
    }
}