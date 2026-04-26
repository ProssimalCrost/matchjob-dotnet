using MatchJob.Data;
using MatchJob.DTOs;
using MatchJob.Models;
using Microsoft.EntityFrameworkCore;

namespace MatchJob.Services;

public class ProfessionalProfileService
{
    private readonly AppDbContext _db;

    public ProfessionalProfileService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ProfessionalProfileResponse> CreateAsync(
        long userId,
    ProfessionalProfileRequest request)
{
    var profile = await _db.ProfessionalProfiles
        .Include(p => p.User)
        .Include(p => p.Category)
        .FirstOrDefaultAsync(p => p.UserId == userId);

    var category = await GetOrCreateCategoryAsync(request.Category);

    if (profile is null)
    {
        profile = new ProfessionalProfile
        {
            UserId = userId,
            Description = request.Description,
            Category = category,
            Location = request.Location,
            PriceRange = request.PriceRange,
            Rating = 0
        };

        _db.ProfessionalProfiles.Add(profile);
    }
    else
    {
        profile.Description = request.Description;
        profile.Category = category;
        profile.Location = request.Location;
        profile.PriceRange = request.PriceRange;
    }

    await _db.SaveChangesAsync();

    profile = await _db.ProfessionalProfiles
        .Include(p => p.User)
        .Include(p => p.Category)
        .FirstAsync(p => p.Id == profile.Id);

    return ToResponse(profile);
}

    public async Task<List<ProfessionalProfileResponse>> ListAsync(
        string? category,
        string? location,
        string? tag)
    {
        var query = _db.ProfessionalProfiles
            .Include(p => p.User)
            .Include(p => p.Category)
            .AsQueryable();

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(p =>
                p.Category.Name.ToLower() == category.ToLower());
        }

        if (!string.IsNullOrEmpty(location))
        {
            query = query.Where(p =>
                p.Location != null &&
                p.Location.ToLower().Contains(location.ToLower()));
        }

        // Tags removidas temporariamente porque ProfessionalProfile não possui mais Tags

        var list = await query.ToListAsync();

        return list.Select(ToResponse).ToList();
    }

    public async Task<ProfessionalProfileResponse?> GetByIdAsync(long id)
    {
        var profile = await _db.ProfessionalProfiles
            .Include(p => p.User)
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);

        return profile is null ? null : ToResponse(profile);
    }

    private async Task<Category> GetOrCreateCategoryAsync(string categoryName)
    {
        var slug = categoryName
            .Trim()
            .ToLower()
            .Replace(" ", "-");

        var category = await _db.Categories
            .FirstOrDefaultAsync(c => c.Slug == slug);

        if (category is not null)
            return category;

        category = new Category
        {
            Name = categoryName,
            Slug = slug
        };

        _db.Categories.Add(category);
        await _db.SaveChangesAsync();

        return category;
    }

    private static ProfessionalProfileResponse ToResponse(ProfessionalProfile profile)
{
    return new ProfessionalProfileResponse(
        profile.Id,
        profile.User.Name,
        profile.Description ?? "",
        profile.Category.Name,
        profile.Location,
        profile.PriceRange,
        profile.Rating
    );
}
}