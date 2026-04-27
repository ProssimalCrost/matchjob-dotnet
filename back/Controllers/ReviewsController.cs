using System.Security.Claims;
using MatchJob.DTOs;
using MatchJob.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MatchJob.Controllers;

[ApiController]
[Route("api/reviews")]
public class ReviewsController : ControllerBase
{
    private readonly ReviewService _reviewService;

    public ReviewsController(ReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create(CreateReviewRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var review = await _reviewService.CreateAsync(userId, request);

        return Ok(review);
    }

    [HttpGet("professional/{professionalProfileId}")]
    public async Task<IActionResult> GetByProfessional(Guid professionalProfileId)
    {
        var reviews = await _reviewService.GetByProfessionalAsync(professionalProfileId);

        return Ok(reviews);
    }

    [HttpGet("professional/{professionalProfileId}/average")]
    public async Task<IActionResult> GetAverage(Guid professionalProfileId)
    {
        var average = await _reviewService.GetAverageRatingAsync(professionalProfileId);

        return Ok(new
        {
            professionalProfileId,
            average
        });
    }
}