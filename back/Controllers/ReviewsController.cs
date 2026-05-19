using System.Security.Claims;
using MatchJob.DTOs;
using MatchJob.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MatchJob.Controllers;

[ApiController]
public class ReviewsController : ControllerBase
{
    private readonly ReviewService _reviewService;

    public ReviewsController(ReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    /// GET /professionals/{professionalProfileId}/reviews
    [HttpGet("professionals/{professionalProfileId:guid}/reviews")]
    public async Task<IActionResult> GetByProfessional(Guid professionalProfileId)
    {
        var reviews = await _reviewService.GetByProfessionalAsync(professionalProfileId);
        return Ok(reviews);
    }

    /// POST /professionals/{professionalProfileId}/reviews
    [Authorize]
    [HttpPost("professionals/{professionalProfileId:guid}/reviews")]
    public async Task<IActionResult> CreateForProfessional(
        Guid professionalProfileId,
        [FromBody] CreateReviewBody body)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var request = new CreateReviewRequest
        {
            ProfessionalProfileId = professionalProfileId,
            Rating = body.Rating,
            Comment = body.Comment
        };

        try
        {
            var review = await _reviewService.CreateAsync(userId, request);
            return Ok(review);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// POST /api/reviews — rota legada mantida
    [Authorize]
    [HttpPost("api/reviews")]
    public async Task<IActionResult> Create([FromBody] CreateReviewRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        try
        {
            var review = await _reviewService.CreateAsync(userId, request);
            return Ok(review);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// GET /api/reviews/professional/{professionalProfileId} — rota legada
    [HttpGet("api/reviews/professional/{professionalProfileId:guid}")]
    public async Task<IActionResult> GetByProfessionalLegacy(Guid professionalProfileId)
    {
        var reviews = await _reviewService.GetByProfessionalAsync(professionalProfileId);
        return Ok(reviews);
    }

    /// GET /api/reviews/professional/{professionalProfileId}/average — rota legada
    [HttpGet("api/reviews/professional/{professionalProfileId:guid}/average")]
    public async Task<IActionResult> GetAverage(Guid professionalProfileId)
    {
        var average = await _reviewService.GetAverageRatingAsync(professionalProfileId);
        return Ok(new { professionalProfileId, average });
    }
}

public class CreateReviewBody
{
    public int Rating { get; set; }
    public string? Comment { get; set; }
}
