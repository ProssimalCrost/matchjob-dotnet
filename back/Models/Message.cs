// Models/Message.cs
namespace MatchJob.Models;

public class Message
{
    public long Id { get; set; }

    public long ConversationId { get; set; }
    public Conversation Conversation { get; set; } = null!;

    public long SenderId { get; set; }
    public User Sender { get; set; } = null!;

    public string Content { get; set; } = string.Empty;

    // Preenchido automaticamente pelo EF ao inserir
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
