using MatchJob.Data;
using MatchJob.DTOs;
using MatchJob.Models;
using Microsoft.EntityFrameworkCore;

namespace MatchJob.Services;

public class FavoriteService
{
    private readonly AppDbContext _db;

    public FavoriteService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<ProfessionalProfileResponse>> GetFavoritesAsync(Guid userId)
    {
        return await _db.Favorites
            .Where(f => f.UserId == userId)
            .Include(f => f.ProfessionalProfile).ThenInclude(p => p.User)
            .Include(f => f.ProfessionalProfile).ThenInclude(p => p.Category)
            .Include(f => f.ProfessionalProfile).ThenInclude(p => p.ProfessionalTags).ThenInclude(pt => pt.Tag)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => new ProfessionalProfileResponse(
                f.ProfessionalProfile.Id,
                f.ProfessionalProfile.UserId,
                f.ProfessionalProfile.User.Name,
                f.ProfessionalProfile.User.Email,
                f.ProfessionalProfile.Title,
                f.ProfessionalProfile.Bio,
                f.ProfessionalProfile.Description,
                f.ProfessionalProfile.CategoryId,
                f.ProfessionalProfile.Category.Name,
                f.ProfessionalProfile.ProfessionalTags.Select(pt => new TagDto(pt.Tag.Id, pt.Tag.Name, pt.Tag.Slug)).ToList(),
                f.ProfessionalProfile.Location,
                f.ProfessionalProfile.PriceRange,
                f.ProfessionalProfile.Price,
                f.ProfessionalProfile.AvatarUrl,
                f.ProfessionalProfile.Available,
                f.ProfessionalProfile.Rating,
                f.ProfessionalProfile.ReviewCount
            ))
            .ToListAsync();
    }

    public async Task<bool> IsFavoriteAsync(Guid userId, Guid professionalProfileId)
    {
        return await _db.Favorites.AnyAsync(f =>
            f.UserId == userId && f.ProfessionalProfileId == professionalProfileId);
    }

    public async Task AddAsync(Guid userId, Guid professionalProfileId)
    {
        var exists = await _db.Favorites.AnyAsync(f =>
            f.UserId == userId && f.ProfessionalProfileId == professionalProfileId);

        if (exists)
            throw new InvalidOperationException("Profissional já está nos favoritos.");

        var profileExists = await _db.ProfessionalProfiles.AnyAsync(p => p.Id == professionalProfileId);
        if (!profileExists)
            throw new KeyNotFoundException("Perfil profissional não encontrado.");

        _db.Favorites.Add(new Favorite
        {
            UserId = userId,
            ProfessionalProfileId = professionalProfileId
        });

        await _db.SaveChangesAsync();
    }

    public async Task RemoveAsync(Guid userId, Guid professionalProfileId)
    {
        var favorite = await _db.Favorites.FirstOrDefaultAsync(f =>
            f.UserId == userId && f.ProfessionalProfileId == professionalProfileId);

        if (favorite == null)
            throw new KeyNotFoundException("Favorito não encontrado.");

        _db.Favorites.Remove(favorite);
        await _db.SaveChangesAsync();
    }
}
