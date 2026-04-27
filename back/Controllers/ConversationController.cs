// Controllers/ConversationController.cs
using MatchJob.DTOs;
using MatchJob.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MatchJob.Controllers;

[ApiController]
[Route("conversations")]
[Authorize]
public class ConversationController : ControllerBase
{
    private readonly ConversationService _service;

    public ConversationController(ConversationService service) => _service = service;

    /// <summary>
    /// POST /conversations
    /// Body: { "clientId": 3, "professionalId": 1 }
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ConversationRequest req)
    {
        try
        {
            var result = await _service.CreateOrGetAsync(req);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// GET /conversations/user/{userId}
    /// </summary>
    [HttpGet("user/{userId:guid}")]
    public async Task<IActionResult> GetByUser(Guid userId)
    {
        var result = await _service.GetByUserAsync(userId);
        return Ok(result);
    }
}
