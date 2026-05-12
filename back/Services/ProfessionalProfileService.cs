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
        Guid userId,
        ProfessionalProfileRequest request)
    {
        var profile = await _db.ProfessionalProfiles
            .Include(p => p.User)
            .Include(p => p.Category)
            .Include(p => p.ProfessionalTags)
                .ThenInclude(pt => pt.Tag)
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
            .Include(p => p.ProfessionalTags)
                .ThenInclude(pt => pt.Tag)
            .FirstAsync(p => p.Id == profile.Id);

        return ToResponse(profile);
    }

   public async Task<PagedResult<ProfessionalProfileResponse>> ListAsync(
    ProfessionalSearchQuery filters)
{
    var page = filters.Page <= 0 ? 1 : filters.Page;
    var pageSize = filters.PageSize <= 0 ? 12 : filters.PageSize;

    if (pageSize > 50)
        pageSize = 50;

    var query = _db.ProfessionalProfiles
        .Include(p => p.User)
        .Include(p => p.Category)
        .Include(p => p.ProfessionalTags)
            .ThenInclude(pt => pt.Tag)
        .AsNoTracking()
        .AsQueryable();

    if (!string.IsNullOrWhiteSpace(filters.Search))
    {
        var search = filters.Search.Trim().ToLower();

        query = query.Where(p =>
            p.User.Name.ToLower().Contains(search) ||
            p.User.Email.ToLower().Contains(search) ||
            (p.Description != null && p.Description.ToLower().Contains(search)) ||
            p.Category.Name.ToLower().Contains(search) ||
            (p.Location != null && p.Location.ToLower().Contains(search)) ||
            p.ProfessionalTags.Any(pt => pt.Tag.Name.ToLower().Contains(search))
        );
    }

    if (!string.IsNullOrWhiteSpace(filters.Category))
    {
        var category = filters.Category.Trim().ToLower();

        query = query.Where(p =>
            p.Category.Name.ToLower() == category
        );
    }

    if (!string.IsNullOrWhiteSpace(filters.Location))
    {
        var location = filters.Location.Trim().ToLower();

        query = query.Where(p =>
            p.Location != null &&
            p.Location.ToLower().Contains(location)
        );
    }

    if (!string.IsNullOrWhiteSpace(filters.Tag))
    {
        var tag = filters.Tag.Trim().ToLower();

        query = query.Where(p =>
            p.ProfessionalTags.Any(pt =>
                pt.Tag.Name.ToLower() == tag
            )
        );
    }

    if (filters.MinRating.HasValue)
    {
        query = query.Where(p => p.Rating >= filters.MinRating.Value);
    }

    var total = await query.CountAsync();

    var list = await query
        .OrderByDescending(p => p.Rating)
        .ThenBy(p => p.User.Name)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();

    return new PagedResult<ProfessionalProfileResponse>
    {
        Data = list.Select(ToResponse).ToList(),
        Total = total,
        Page = page,
        PageSize = pageSize,
        TotalPages = (int)Math.Ceiling(total / (double)pageSize)
    };
}

    public async Task<ProfessionalProfileResponse?> GetByIdAsync(Guid id)
    {
        var profile = await _db.ProfessionalProfiles
            .Include(p => p.User)
            .Include(p => p.Category)
            .Include(p => p.ProfessionalTags)
                .ThenInclude(pt => pt.Tag)
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
            profile.UserId,
            profile.User.Name,
            profile.User.Email,
            profile.Description ?? "",
            profile.Category.Name,
            profile.ProfessionalTags.Select(pt => pt.Tag.Name).ToList(),
            profile.Location,
            profile.PriceRange,
            profile.Rating
        );
    }
}
