namespace MatchJob.Models;

public class ProfessionalTag
{
    public long ProfessionalId { get; set; }
    public ProfessionalProfile Professional { get; set; } = null!;

    public Guid TagId { get; set; }
    public Tag Tag { get; set; } = null!;
}
