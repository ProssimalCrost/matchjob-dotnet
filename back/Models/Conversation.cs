// Models/Conversation.cs
namespace MatchJob.Models;

public class Conversation
{
    public long Id { get; set; }

    public long ClientId { get; set; }
    public User Client { get; set; } = null!;

    public long ProfessionalId { get; set; }
    public User Professional { get; set; } = null!;

    // Navegação para mensagens
    public ICollection<Message> Messages { get; set; } = new List<Message>();
}
