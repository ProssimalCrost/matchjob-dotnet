// Controllers/ProfessionalController.cs
using MatchJob.DTOs;
using MatchJob.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MatchJob.Controllers;

/// <summary>
/// Endpoints de profissionais — requerem JWT
/// </summary>
[ApiController]
[Route("professionals")]
public class ProfessionalController : ControllerBase
{
    private readonly ProfessionalProfileService _service;

    public ProfessionalController(ProfessionalProfileService service) => _service = service;

    /// <summary>
    /// GET /professionals
    /// GET /professionals?category=Design
    /// GET /professionals?location=São Paulo
    /// GET /professionals?tag=Figma
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> List(
        [FromQuery] string? category,
        [FromQuery] string? location,
        [FromQuery] string? tag)
    {
        var result = await _service.ListAsync(category, location, tag);
        return Ok(result);
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
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// POST /professionals?userId={guid}
    /// Body: { "description": "...", "category": "Dev", "tags": [...], ... }
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
            return Ok("Perfil profissional criado com sucesso");
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
