using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MatchJob.Models
{
    public class Review
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ReviewerId { get; set; }
    public User Reviewer { get; set; } = null!;

    public Guid ProfessionalProfileId { get; set; }
    public ProfessionalProfile ProfessionalProfile { get; set; } = null!;

    public int Rating { get; set; }
    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
}