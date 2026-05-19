using System.Security.Claims;
using MatchJob.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MatchJob.Controllers;

[ApiController]
[Route("favorites")]
[Authorize]
public class FavoriteController : ControllerBase
{
    private readonly FavoriteService _service;

    public FavoriteController(FavoriteService service) => _service = service;

    /// GET /favorites — lista favoritos do usuário autenticado
    [HttpGet]
    public async Task<IActionResult> List()
    {
        var userId = GetUserId();
        var result = await _service.GetFavoritesAsync(userId);
        return Ok(result);
    }

    /// GET /favorites/{professionalProfileId}/check
    [HttpGet("{professionalProfileId:guid}/check")]
    public async Task<IActionResult> Check(Guid professionalProfileId)
    {
        var userId = GetUserId();
        var isFav = await _service.IsFavoriteAsync(userId, professionalProfileId);
        return Ok(new { isFavorite = isFav });
    }

    /// POST /favorites/{professionalProfileId}
    [HttpPost("{professionalProfileId:guid}")]
    public async Task<IActionResult> Add(Guid professionalProfileId)
    {
        try
        {
            var userId = GetUserId();
            await _service.AddAsync(userId, professionalProfileId);
            return Ok(new { message = "Adicionado aos favoritos." });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// DELETE /favorites/{professionalProfileId}
    [HttpDelete("{professionalProfileId:guid}")]
    public async Task<IActionResult> Remove(Guid professionalProfileId)
    {
        try
        {
            var userId = GetUserId();
            await _service.RemoveAsync(userId, professionalProfileId);
            return Ok(new { message = "Removido dos favoritos." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    private Guid GetUserId()
    {
        var claim =
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
            User.FindFirst("sub")?.Value;

        if (!Guid.TryParse(claim, out var userId))
            throw new UnauthorizedAccessException("Token inválido.");

        return userId;
    }
}
