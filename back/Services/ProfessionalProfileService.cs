// Services/ProfessionalProfileService.cs
using MatchJob.Data;
using MatchJob.DTOs;
using MatchJob.Models;
using Microsoft.EntityFrameworkCore;

namespace MatchJob.Services;

public class ProfessionalProfileService
{
    private readonly AppDbContext _db;

    public ProfessionalProfileService(AppDbContext db) => _db = db;

    /// <summary>
    /// Cria ou atualiza o perfil de um profissional
    /// </summary>
    public async Task<ProfessionalProfileResponse> CreateOrUpdateAsync(long userId, ProfessionalProfileRequest req)
    {
        var user = await _db.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException($"Usuário não encontrado: {userId}");

        // Busca perfil existente ou cria novo
        var profile = await _db.ProfessionalProfiles.FirstOrDefaultAsync(p => p.UserId == userId);

        if (profile is null)
        {
            profile = new ProfessionalProfile { UserId = userId };
            _db.ProfessionalProfiles.Add(profile);
        }

        profile.Description = req.Description;
        profile.Category    = req.Category;
        profile.Tags        = req.Tags ?? [];
        profile.Location    = req.Location;
        profile.PriceRange  = req.PriceRange;

        await _db.SaveChangesAsync();

        // Recarrega com o User para o DTO
        await _db.Entry(profile).Reference(p => p.User).LoadAsync();
        return ToResponse(profile);
    }

    /// <summary>
    /// Lista profissionais com filtros opcionais: category, location, tag
    /// </summary>
   public async Task<List<ProfessionalProfileResponse>> ListAsync(
    string? category, string? location, string? tag)
{
    category = category?.Trim();
    location = location?.Trim();
    tag = tag?.Trim();

    var query = _db.ProfessionalProfiles
        .AsNoTracking()
        .Include(p => p.User)
        .AsQueryable();

    if (!string.IsNullOrWhiteSpace(category))
        query = query.Where(p => EF.Functions.ILike(p.Category, category));

    if (!string.IsNullOrWhiteSpace(location))
        query = query.Where(p =>
            p.Location != null &&
            EF.Functions.ILike(p.Location, $"%{location}%"));

    if (!string.IsNullOrWhiteSpace(tag))
        query = query.Where(p =>
            p.Tags.Any(t => EF.Functions.ILike(t, tag)));

    var list = await query.ToListAsync();

    return list.Select(ToResponse).ToList();
}

    /// <summary>
    /// Busca perfil pelo ID do perfil
    /// </summary>
    public async Task<ProfessionalProfileResponse> GetByIdAsync(long id)
    {
        var profile = await _db.ProfessionalProfiles
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.Id == id)
            ?? throw new KeyNotFoundException($"Perfil não encontrado: {id}");

        return ToResponse(profile);
    }

    private static ProfessionalProfileResponse ToResponse(ProfessionalProfile p) =>
        new(
            Id:          p.Id,
            UserId:      p.UserId,
            UserName:    p.User.Name,
            UserEmail:   p.User.Email,
            Description: p.Description,
            Category:    p.Category,
            Tags:        p.Tags,
            Location:    p.Location,
            PriceRange:  p.PriceRange,
            Rating:      p.Rating
        );
}
