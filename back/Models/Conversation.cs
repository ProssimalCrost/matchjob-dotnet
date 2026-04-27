// Models/Conversation.cs
namespace MatchJob.Models;

public class Conversation
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ClientId { get; set; }
    public User Client { get; set; } = null!;

    public Guid ProfessionalId { get; set; }
    public User Professional { get; set; } = null!;

    // Navegação para mensagens
    public ICollection<Message> Messages { get; set; } = new List<Message>();
}
