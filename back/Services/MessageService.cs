// Services/MessageService.cs
using MatchJob.Data;
using MatchJob.DTOs;
using MatchJob.Models;
using Microsoft.EntityFrameworkCore;

namespace MatchJob.Services;

public class MessageService
{
    private readonly AppDbContext _db;

    public MessageService(AppDbContext db) => _db = db;

    /// <summary>
    /// Envia uma nova mensagem em uma conversa
    /// </summary>
    public async Task<MessageResponse> SendAsync(MessageRequest req)
    {
        // Valida conversa e remetente
        var conv = await _db.Conversations.FindAsync(req.ConversationId)
            ?? throw new KeyNotFoundException("Conversa não encontrada");

        var sender = await _db.Users.FindAsync(req.SenderId)
            ?? throw new KeyNotFoundException("Remetente não encontrado");

        var msg = new Message
        {
            ConversationId = req.ConversationId,
            SenderId       = req.SenderId,
            Content        = req.Content,
            CreatedAt      = DateTime.UtcNow
        };

        _db.Messages.Add(msg);
        await _db.SaveChangesAsync();

        return new MessageResponse(
            msg.Id,
            msg.ConversationId,
            msg.SenderId,
            sender.Name,
            msg.Content,
            msg.CreatedAt
        );
    }

    /// <summary>
    /// Lista todas as mensagens de uma conversa em ordem cronológica
    /// </summary>
    public async Task<List<MessageResponse>> GetByConversationAsync(long conversationId)
    {
        var messages = await _db.Messages
            .Include(m => m.Sender)
            .Where(m => m.ConversationId == conversationId)
            .OrderBy(m => m.CreatedAt)
            .ToListAsync();

        return messages.Select(m => new MessageResponse(
            m.Id,
            m.ConversationId,
            m.SenderId,
            m.Sender.Name,
            m.Content,
            m.CreatedAt
        )).ToList();
    }
}
