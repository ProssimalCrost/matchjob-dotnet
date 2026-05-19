namespace MatchJob.Models;

public class Favorite
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid ProfessionalProfileId { get; set; }
    public ProfessionalProfile ProfessionalProfile { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
