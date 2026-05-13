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

    public async Task CreateAsync(Guid userId, ProfessionalProfileRequest req)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            throw new KeyNotFoundException("Usuário não encontrado.");
        }

        var existingProfile = await _db.ProfessionalProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (existingProfile != null)
        {
            throw new Exception("Usuário já possui um perfil profissional.");
        }

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

    public async Task<PagedResult<ProfessionalProfileResponse>> ListAsync(
        ProfessionalSearchQuery filters)
    {
        var page = filters.Page <= 0 ? 1 : filters.Page;
        var pageSize = filters.PageSize <= 0 ? 12 : filters.PageSize;

        if (pageSize > 50)
        {
            pageSize = 50;
        }

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
                p.ProfessionalTags.Any(pt =>
                    pt.Tag.Name.ToLower().Contains(search)
                )
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
                p.Location != null && p.Location.ToLower().Contains(location)
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

        var professionals = await query
            .OrderByDescending(p => p.Rating)
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
            .Include(p => p.ProfessionalTags)
                .ThenInclude(pt => pt.Tag)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id);

        if (profile == null)
        {
            throw new KeyNotFoundException("Perfil profissional não encontrado.");
        }

        return ToResponse(profile);
    }

    public async Task<ProfessionalProfileResponse?> GetByUserIdAsync(Guid userId)
    {
        var profile = await _db.ProfessionalProfiles
            .Include(p => p.User)
            .Include(p => p.Category)
            .Include(p => p.ProfessionalTags)
                .ThenInclude(pt => pt.Tag)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (profile == null)
        {
            return null;
        }

        return ToResponse(profile);
    }

    public async Task<ProfessionalProfileResponse> UpdateByUserIdAsync(
        Guid userId,
        UpdateProfessionalProfileRequest request)
    {
        var profile = await _db.ProfessionalProfiles
            .Include(p => p.ProfessionalTags)
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (profile == null)
        {
            throw new KeyNotFoundException("Perfil profissional não encontrado.");
        }

        var category = await _db.Categories
            .FirstOrDefaultAsync(c => c.Id == request.CategoryId);

        if (category == null)
        {
            throw new KeyNotFoundException("Categoria não encontrada.");
        }

        profile.Description = request.Description;
        profile.CategoryId = category.Id;
        profile.Category = category;
        profile.Location = request.Location;
        profile.PriceRange = request.PriceRange;

        profile.ProfessionalTags.Clear();

        foreach (var tagId in request.TagIds)
        {
            var tag = await _db.Tags.FirstOrDefaultAsync(t => t.Id == tagId);

            if (tag == null)
            {
                throw new KeyNotFoundException($"Tag {tagId} não encontrada.");
            }

            profile.ProfessionalTags.Add(new ProfessionalTag
            {
                ProfessionalId = profile.Id,
                TagId = tag.Id,
                Tag = tag
            });
        }

        await _db.SaveChangesAsync();

        var updatedProfile = await _db.ProfessionalProfiles
            .Include(p => p.User)
            .Include(p => p.Category)
            .Include(p => p.ProfessionalTags)
                .ThenInclude(pt => pt.Tag)
            .AsNoTracking()
            .FirstAsync(p => p.Id == profile.Id);

        return ToResponse(updatedProfile);
    }

    private async Task<Category> GetOrCreateCategoryAsync(string categoryName)
    {
        var normalizedName = categoryName.Trim();

        var category = await _db.Categories
            .FirstOrDefaultAsync(c => c.Name.ToLower() == normalizedName.ToLower());

        if (category != null)
        {
            return category;
        }

        category = new Category
        {
            Id = Guid.NewGuid(),
            Name = normalizedName
        };

        _db.Categories.Add(category);
        await _db.SaveChangesAsync();

        return category;
    }

    private async Task<Tag> GetOrCreateTagAsync(string tagName)
    {
        var normalizedName = tagName.Trim();

        var tag = await _db.Tags
            .FirstOrDefaultAsync(t => t.Name.ToLower() == normalizedName.ToLower());

        if (tag != null)
        {
            return tag;
        }

        tag = new Tag
        {
            Id = Guid.NewGuid(),
            Name = normalizedName
        };

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
            profile.Description,
            profile.Category.Name,
            profile.ProfessionalTags
                .Select(pt => pt.Tag.Name)
                .ToList(),
            profile.Location,
            profile.PriceRange,
            profile.Rating
        );
    }
}
