using MatchJob.Data;
using MatchJob.DTOs;
using MatchJob.Models;
using Microsoft.EntityFrameworkCore;

namespace MatchJob.Services;

public class ServiceRequestService
{
    private readonly AppDbContext _db;

    public ServiceRequestService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<ServiceRequestResponse>> ListForUserAsync(Guid userId)
    {
        var requests = await BaseQuery()
            .Where(r => r.ClientId == userId || r.ProfessionalId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return requests.Select(ToResponse).ToList();
    }

    public async Task<ServiceRequestResponse> CreateAsync(
        Guid clientId,
        CreateServiceRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            throw new InvalidOperationException("Titulo do servico e obrigatorio.");
        }

        if (string.IsNullOrWhiteSpace(request.Description))
        {
            throw new InvalidOperationException("Descricao do servico e obrigatoria.");
        }

        var client = await _db.Users.FindAsync(clientId)
            ?? throw new KeyNotFoundException("Cliente nao encontrado.");

        var professional = await ResolveProfessionalUserAsync(request.ProfessionalId);

        if (professional.Id == client.Id)
        {
            throw new InvalidOperationException("Voce nao pode solicitar um servico para si mesmo.");
        }

        Category? category = null;
        if (request.CategoryId.HasValue)
        {
            category = await _db.Categories.FindAsync(request.CategoryId.Value)
                ?? throw new KeyNotFoundException("Categoria nao encontrada.");
        }

        var serviceRequest = new ServiceRequest
        {
            ClientId = client.Id,
            Client = client,
            ProfessionalId = professional.Id,
            Professional = professional,
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            CategoryId = category?.Id,
            Category = category,
            ScheduledDate = request.ScheduledDate,
            Location = string.IsNullOrWhiteSpace(request.Location)
                ? null
                : request.Location.Trim(),
            Status = ServiceRequestStatus.Pending
        };

        _db.ServiceRequests.Add(serviceRequest);
        await _db.SaveChangesAsync();

        var created = await BaseQuery()
            .FirstAsync(r => r.Id == serviceRequest.Id);

        return ToResponse(created);
    }

    public async Task<ServiceRequestResponse> UpdateStatusAsync(
        Guid userId,
        Guid requestId,
        ServiceRequestStatus status)
    {
        var serviceRequest = await BaseQuery()
            .FirstOrDefaultAsync(r => r.Id == requestId)
            ?? throw new KeyNotFoundException("Solicitacao de servico nao encontrada.");

        if (serviceRequest.ClientId != userId && serviceRequest.ProfessionalId != userId)
        {
            throw new UnauthorizedAccessException("Usuario sem permissao para alterar esta solicitacao.");
        }

        if (!CanSetStatus(serviceRequest, userId, status))
        {
            throw new InvalidOperationException("Transicao de status nao permitida.");
        }

        serviceRequest.Status = status;
        serviceRequest.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return ToResponse(serviceRequest);
    }

    public async Task CancelAsync(Guid userId, Guid requestId)
    {
        var serviceRequest = await _db.ServiceRequests
            .FirstOrDefaultAsync(r => r.Id == requestId)
            ?? throw new KeyNotFoundException("Solicitacao de servico nao encontrada.");

        if (serviceRequest.ClientId != userId)
        {
            throw new UnauthorizedAccessException("Somente o cliente pode cancelar a solicitacao.");
        }

        if (serviceRequest.Status is ServiceRequestStatus.Completed or ServiceRequestStatus.Rejected)
        {
            throw new InvalidOperationException("Esta solicitacao nao pode ser cancelada.");
        }

        serviceRequest.Status = ServiceRequestStatus.Canceled;
        serviceRequest.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
    }

    private async Task<User> ResolveProfessionalUserAsync(Guid professionalId)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Id == professionalId);

        if (user != null)
        {
            return user;
        }

        var profile = await _db.ProfessionalProfiles
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.Id == professionalId);

        return profile?.User
            ?? throw new KeyNotFoundException("Profissional nao encontrado.");
    }

    private IQueryable<ServiceRequest> BaseQuery()
    {
        return _db.ServiceRequests
            .Include(r => r.Client)
            .Include(r => r.Professional)
            .Include(r => r.Category);
    }

    private static bool CanSetStatus(
        ServiceRequest serviceRequest,
        Guid userId,
        ServiceRequestStatus status)
    {
        if (serviceRequest.ProfessionalId == userId)
        {
            return status is ServiceRequestStatus.Accepted
                or ServiceRequestStatus.Rejected
                or ServiceRequestStatus.InProgress
                or ServiceRequestStatus.Completed;
        }

        return status == ServiceRequestStatus.Canceled;
    }

    private static ServiceRequestResponse ToResponse(ServiceRequest request)
    {
        return new ServiceRequestResponse(
            request.Id,
            request.ClientId,
            request.Client.Name,
            request.ProfessionalId,
            request.Professional.Name,
            request.Title,
            request.Description,
            request.CategoryId,
            request.Category?.Name,
            request.Status,
            request.PriceAgreed?.ToString("0.##"),
            request.ScheduledDate,
            request.Location,
            request.CreatedAt,
            request.UpdatedAt
        );
    }
}
