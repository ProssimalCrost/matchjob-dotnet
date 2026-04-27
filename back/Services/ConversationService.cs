// Services/ConversationService.cs
using MatchJob.Data;
using MatchJob.DTOs;
using Microsoft.EntityFrameworkCore;
using MatchJob.Models;

namespace MatchJob.Services;

public class ConversationService
{
    private readonly AppDbContext _db;

    public ConversationService(AppDbContext db) => _db = db;

    /// <summary>
    /// Cria conversa entre cliente e profissional (idempotente — retorna existente se já tiver)
    /// </summary>
    public async Task<ConversationResponse> CreateOrGetAsync(ConversationRequest req)
    {
        // Verifica se já existe
        var existing = await _db.Conversations
            .Include(c => c.Client)
            .Include(c => c.Professional)
            .FirstOrDefaultAsync(c =>
                c.ClientId == req.ClientId &&
                c.ProfessionalId == req.ProfessionalId);

        if (existing is not null)
            return ToResponse(existing);

        // Valida os usuários
        var client = await _db.Users.FindAsync(req.ClientId)
            ?? throw new KeyNotFoundException("Cliente não encontrado");

        var professional = await _db.Users.FindAsync(req.ProfessionalId)
            ?? throw new KeyNotFoundException("Profissional não encontrado");

        var conv = new Conversation
        {
            ClientId       = req.ClientId,
            ProfessionalId = req.ProfessionalId
        };

        _db.Conversations.Add(conv);
        await _db.SaveChangesAsync();

        conv.Client       = client;
        conv.Professional = professional;

        return ToResponse(conv);
    }

    /// <summary>
    /// Lista todas as conversas de um usuário (como cliente ou profissional)
    /// </summary>
    public async Task<List<ConversationResponse>> GetByUserAsync(Guid userId)
    {
        var list = await _db.Conversations
            .Include(c => c.Client)
            .Include(c => c.Professional)
            .Where(c => c.ClientId == userId || c.ProfessionalId == userId)
            .ToListAsync();

        return list.Select(ToResponse).ToList();
    }

    private static ConversationResponse ToResponse(Conversation c) =>
        new(c.Id, c.ClientId, c.Client.Name, c.ProfessionalId, c.Professional.Name);
}
