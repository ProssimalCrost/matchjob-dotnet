namespace MatchJob.Models;

public enum Role { CLIENT, PROFESSIONAL }

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public Role Role { get; set; }

    public ProfessionalProfile? ProfessionalProfile { get; set; }
    public UserSettings? Settings { get; set; }
}
