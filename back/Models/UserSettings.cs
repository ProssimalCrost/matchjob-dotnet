namespace MatchJob.Models;

public class UserSettings
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }

    public bool NotificationsEnabled { get; set; }
    public bool DarkMode { get; set; }
    public User User { get; set; } = null!;
}
