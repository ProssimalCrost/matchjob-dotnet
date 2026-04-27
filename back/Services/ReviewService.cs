using MatchJob.Data;
using MatchJob.DTOs;
using MatchJob.Models;
using Microsoft.EntityFrameworkCore;

namespace MatchJob.Services;

public class ReviewService
{
    private readonly AppDbContext _db;

    public ReviewService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ReviewResponse> CreateAsync(Guid reviewerId, CreateReviewRequest request)
    {
        var professional = await _db.ProfessionalProfiles
            .FirstOrDefaultAsync(p => p.Id == request.ProfessionalProfileId);

        if (professional == null)
            throw new Exception("Perfil profissional não encontrado.");

        if (professional.UserId == reviewerId)
            throw new Exception("Você não pode avaliar seu próprio perfil.");

        var alreadyReviewed = await _db.Reviews.AnyAsync(r =>
            r.ReviewerId == reviewerId &&
            r.ProfessionalProfileId == request.ProfessionalProfileId);

        if (alreadyReviewed)
            throw new Exception("Você já avaliou esse profissional.");

        var review = new Review
        {
            ReviewerId = reviewerId,
            ProfessionalProfileId = request.ProfessionalProfileId,
            Rating = request.Rating,
            Comment = request.Comment
        };

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync();

        return await ToResponse(review.Id);
    }

    public async Task<List<ReviewResponse>> GetByProfessionalAsync(Guid professionalProfileId)
    {
        return await _db.Reviews
            .Include(r => r.Reviewer)
            .Where(r => r.ProfessionalProfileId == professionalProfileId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewResponse
            {
                Id = r.Id,
                ReviewerId = r.ReviewerId,
                ReviewerName = r.Reviewer.Name,
                ProfessionalProfileId = r.ProfessionalProfileId,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<double> GetAverageRatingAsync(Guid professionalProfileId)
    {
        var reviews = _db.Reviews
            .Where(r => r.ProfessionalProfileId == professionalProfileId);

        if (!await reviews.AnyAsync())
            return 0;

        return await reviews.AverageAsync(r => r.Rating);
    }

    private async Task<ReviewResponse> ToResponse(Guid reviewId)
    {
        var review = await _db.Reviews
            .Include(r => r.Reviewer)
            .FirstAsync(r => r.Id == reviewId);

        return new ReviewResponse
        {
            Id = review.Id,
            ReviewerId = review.ReviewerId,
            ReviewerName = review.Reviewer.Name,
            ProfessionalProfileId = review.ProfessionalProfileId,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };
    }
}