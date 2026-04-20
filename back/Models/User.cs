// Models/User.cs
namespace MatchJob.Models;

public enum Role { CLIENT, PROFESSIONAL }

public class User
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty; // BCrypt hash
    public Role Role { get; set; }

    // Navegação
    public ProfessionalProfile? ProfessionalProfile { get; set; }
}
