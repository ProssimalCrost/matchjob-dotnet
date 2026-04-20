// Controllers/MessageController.cs
using MatchJob.DTOs;
using MatchJob.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MatchJob.Controllers;

[ApiController]
[Route("messages")]
[Authorize]
public class MessageController : ControllerBase
{
    private readonly MessageService _service;

    public MessageController(MessageService service) => _service = service;

    /// <summary>
    /// POST /messages
    /// Body: { "conversationId": 1, "senderId": 3, "content": "Olá!" }
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Send([FromBody] MessageRequest req)
    {
        try
        {
            var result = await _service.SendAsync(req);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// GET /messages/{conversationId}
    /// </summary>
    [HttpGet("{conversationId:long}")]
    public async Task<IActionResult> GetByConversation(long conversationId)
    {
        var result = await _service.GetByConversationAsync(conversationId);
        return Ok(result);
    }
}
