namespace MatchJob.Models;

public enum ServiceRequestStatus
{
    Pending,
    Accepted,
    InProgress,
    Completed,
    Canceled,
    Rejected
}

public class ServiceRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ClientId { get; set; }
    public User Client { get; set; } = null!;

    public Guid ProfessionalId { get; set; }
    public User Professional { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public Guid? CategoryId { get; set; }
    public Category? Category { get; set; }

    public ServiceRequestStatus Status { get; set; } = ServiceRequestStatus.Pending;
    public decimal? PriceAgreed { get; set; }
    public DateTime? ScheduledDate { get; set; }
    public string? Location { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
