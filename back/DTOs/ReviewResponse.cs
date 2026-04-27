using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MatchJob.DTOs;

public class ReviewResponse
{
    public Guid Id { get; set; }
    public Guid ReviewerId { get; set; }
    public string ReviewerName { get; set; } = string.Empty;

    public Guid ProfessionalProfileId { get; set; }

    public int Rating { get; set; }
    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; }
}