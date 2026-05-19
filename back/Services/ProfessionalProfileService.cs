// Services/ProfessionalProfileService.cs
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

    public async Task<ProfessionalProfileResponse> CreateForMeAsync(Guid userId, CreateMyProfileRequest req)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new KeyNotFoundException("Usuário não encontrado.");

        var existing = await _db.ProfessionalProfiles.AnyAsync(p => p.UserId == userId);
        if (existing)
            throw new InvalidOperationException("Usuário já possui um perfil profissional.");

        var category = await _db.Categories.FirstOrDefaultAsync(c => c.Id == req.CategoryId)
            ?? throw new KeyNotFoundException("Categoria não encontrada.");

        var profile = new ProfessionalProfile
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            User = user,
            CategoryId = category.Id,
            Category = category,
            Title = req.Title,
            Bio = req.Bio,
            Description = req.Description,
            Price = req.Price,
            Location = req.Location,
            PriceRange = req.PriceRange,
            AvatarUrl = req.AvatarUrl,
            Available = req.Available,
            Rating = 0,
            ReviewCount = 0
        };

        foreach (var tagId in req.TagIds)
        {
            var tag = await _db.Tags.FirstOrDefaultAsync(t => t.Id == tagId)
                ?? throw new KeyNotFoundException($"Tag {tagId} não encontrada.");

            profile.ProfessionalTags.Add(new ProfessionalTag
            {
                ProfessionalId = profile.Id,
                TagId = tag.Id,
                Tag = tag
            });
        }

        _db.ProfessionalProfiles.Add(profile);
        await _db.SaveChangesAsync();

        return await GetByIdAsync(profile.Id);
    }

    public async Task CreateAsync(Guid userId, ProfessionalProfileRequest req)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new KeyNotFoundException("Usuário não encontrado.");

        var existingProfile = await _db.ProfessionalProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
        if (existingProfile != null)
            throw new Exception("Usuário já possui um perfil profissional.");

        var category = await GetOrCreateCategoryAsync(req.Category);

        var profile = new ProfessionalProfile
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            User = user,
            Description = req.Description,
            Category = category,
            Location = req.Location,
            PriceRange = req.PriceRange,
            Rating = 0
        };

        foreach (var tagName in req.Tags ?? new List<string>())
        {
            var tag = await GetOrCreateTagAsync(tagName);
            profile.ProfessionalTags.Add(new ProfessionalTag
            {
                ProfessionalId = profile.Id,
                TagId = tag.Id,
                Tag = tag
            });
        }

        _db.ProfessionalProfiles.Add(profile);
        await _db.SaveChangesAsync();
    }

    public async Task<PagedResult<ProfessionalProfileResponse>> ListAsync(ProfessionalSearchQuery filters)
    {
        var page = filters.Page <= 0 ? 1 : filters.Page;
        var pageSize = filters.PageSize <= 0 ? 12 : Math.Min(filters.PageSize, 50);

        var query = _db.ProfessionalProfiles
            .Include(p => p.User)
            .Include(p => p.Category)
            .Include(p => p.ProfessionalTags).ThenInclude(pt => pt.Tag)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filters.Search))
        {
            var search = filters.Search.Trim().ToLower();
            query = query.Where(p =>
                p.User.Name.ToLower().Contains(search) ||
                (p.Title != null && p.Title.ToLower().Contains(search)) ||
                (p.Bio != null && p.Bio.ToLower().Contains(search)) ||
                (p.Description != null && p.Description.ToLower().Contains(search)) ||
                p.Category.Name.ToLower().Contains(search) ||
                (p.Location != null && p.Location.ToLower().Contains(search)) ||
                p.ProfessionalTags.Any(pt => pt.Tag.Name.ToLower().Contains(search))
            );
        }

        if (!string.IsNullOrWhiteSpace(filters.Category))
        {
            var cat = filters.Category.Trim().ToLower();
            query = query.Where(p => p.Category.Name.ToLower() == cat);
        }

        if (!string.IsNullOrWhiteSpace(filters.Location))
        {
            var loc = filters.Location.Trim().ToLower();
            query = query.Where(p => p.Location != null && p.Location.ToLower().Contains(loc));
        }

        if (!string.IsNullOrWhiteSpace(filters.Tag))
        {
            var tag = filters.Tag.Trim().ToLower();
            query = query.Where(p => p.ProfessionalTags.Any(pt => pt.Tag.Name.ToLower() == tag));
        }

        if (filters.MinRating.HasValue)
            query = query.Where(p => p.Rating >= filters.MinRating.Value);

        if (filters.Available.HasValue)
            query = query.Where(p => p.Available == filters.Available.Value);

        var total = await query.CountAsync();

        var professionals = await query
            .OrderByDescending(p => p.Available)
            .ThenByDescending(p => p.Rating)
            .ThenByDescending(p => p.ReviewCount)
            .ThenBy(p => p.User.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<ProfessionalProfileResponse>
        {
            Data = professionals.Select(ToResponse).ToList(),
            Total = total,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(total / (double)pageSize)
        };
    }

    public async Task<ProfessionalProfileResponse> GetByIdAsync(Guid id)
    {
        var profile = await _db.ProfessionalProfiles
            .Include(p => p.User)
            .Include(p => p.Category)
            .Include(p => p.ProfessionalTags).ThenInclude(pt => pt.Tag)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id)
            ?? throw new KeyNotFoundException("Perfil profissional não encontrado.");

        return ToResponse(profile);
    }

    public async Task<ProfessionalProfileResponse?> GetByUserIdAsync(Guid userId)
    {
        var profile = await _db.ProfessionalProfiles
            .Include(p => p.User)
            .Include(p => p.Category)
            .Include(p => p.ProfessionalTags).ThenInclude(pt => pt.Tag)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId);

        return profile == null ? null : ToResponse(profile);
    }

    public async Task<ProfessionalProfileResponse> UpdateByUserIdAsync(Guid userId, UpdateProfessionalProfileRequest request)
    {
        var profile = await _db.ProfessionalProfiles
            .Include(p => p.ProfessionalTags)
            .FirstOrDefaultAsync(p => p.UserId == userId)
            ?? throw new KeyNotFoundException("Perfil profissional não encontrado.");

        var category = await _db.Categories.FirstOrDefaultAsync(c => c.Id == request.CategoryId)
            ?? throw new KeyNotFoundException("Categoria não encontrada.");

        profile.Title = request.Title;
        profile.Bio = request.Bio;
        profile.Description = request.Description;
        profile.CategoryId = category.Id;
        profile.Category = category;
        profile.Location = request.Location;
        profile.PriceRange = request.PriceRange;
        profile.Price = request.Price;
        profile.AvatarUrl = request.AvatarUrl;
        profile.Available = request.Available;

        profile.ProfessionalTags.Clear();

        foreach (var tagId in request.TagIds)
        {
            var tag = await _db.Tags.FirstOrDefaultAsync(t => t.Id == tagId)
                ?? throw new KeyNotFoundException($"Tag {tagId} não encontrada.");

            profile.ProfessionalTags.Add(new ProfessionalTag
            {
                ProfessionalId = profile.Id,
                TagId = tag.Id,
                Tag = tag
            });
        }

        await _db.SaveChangesAsync();

        return await GetByIdAsync(profile.Id);
    }

    public async Task RecalculateRatingAsync(Guid profileId)
    {
        var profile = await _db.ProfessionalProfiles.FirstOrDefaultAsync(p => p.Id == profileId);
        if (profile == null) return;

        var reviews = _db.Reviews.Where(r => r.ProfessionalProfileId == profileId);
        var count = await reviews.CountAsync();

        profile.Rating = count > 0 ? await reviews.AverageAsync(r => r.Rating) : 0.0;
        profile.ReviewCount = count;

        await _db.SaveChangesAsync();
    }

    private async Task<Category> GetOrCreateCategoryAsync(string categoryName)
    {
        var name = categoryName.Trim();
        var category = await _db.Categories.FirstOrDefaultAsync(c => c.Name.ToLower() == name.ToLower());

        if (category != null) return category;

        category = new Category { Id = Guid.NewGuid(), Name = name, Slug = name.ToLower().Replace(" ", "-") };
        _db.Categories.Add(category);
        await _db.SaveChangesAsync();

        return category;
    }

    private async Task<Tag> GetOrCreateTagAsync(string tagName)
    {
        var name = tagName.Trim();
        var tag = await _db.Tags.FirstOrDefaultAsync(t => t.Name.ToLower() == name.ToLower());

        if (tag != null) return tag;

        tag = new Tag { Id = Guid.NewGuid(), Name = name, Slug = name.ToLower().Replace(" ", "-") };
        _db.Tags.Add(tag);
        await _db.SaveChangesAsync();

        return tag;
    }

    private static ProfessionalProfileResponse ToResponse(ProfessionalProfile profile)
    {
        return new ProfessionalProfileResponse(
            profile.Id,
            profile.UserId,
            profile.User.Name,
            profile.User.Email,
            profile.Title,
            profile.Bio,
            profile.Description,
            profile.CategoryId,
            profile.Category.Name,
            profile.ProfessionalTags.Select(pt => new TagDto(pt.Tag.Id, pt.Tag.Name, pt.Tag.Slug)).ToList(),
            profile.Location,
            profile.PriceRange,
            profile.Price,
            profile.AvatarUrl,
            profile.Available,
            profile.Rating,
            profile.ReviewCount
        );
    }
}
