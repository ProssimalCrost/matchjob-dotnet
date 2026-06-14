// Services/AuthService.cs
using MatchJob.Data;
using MatchJob.DTOs;
using MatchJob.Models;
using Microsoft.EntityFrameworkCore;

namespace MatchJob.Services;

public class AuthService
{
    private readonly AppDbContext _db;

    public AuthService(AppDbContext db) => _db = db;

    /// <summary>
    /// Cria ou atualiza o usuário local com base no JWT do Supabase.
    /// Garante que User.Id == Supabase auth.users UUID.
    /// Chamado em POST /auth/sync-user após qualquer login/cadastro.
    /// </summary>
    public async Task<AuthResponse> SyncUserAsync(string supabaseId, string email, string name)
    {
        var guid = Guid.Parse(supabaseId);

        // Caso 1: usuário já sincronizado — apenas atualiza nome/email
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == guid);
        if (user != null)
        {
            user.Name  = name;
            user.Email = email;
            await _db.SaveChangesAsync();
            return BuildInfo(user);
        }

        // Caso 2: usuário existente via fluxo antigo (ID diferente do Supabase UUID)
        user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user != null)
        {
            await using var transaction = await _db.Database.BeginTransactionAsync();
            try
            {
                await MigrateUserIdAsync(user, guid, email, name);
                _db.Entry(user).State = EntityState.Detached;

                user = (await _db.Users.FirstOrDefaultAsync(u => u.Id == guid))!;
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
            return BuildInfo(user);
        }

        // Caso 3: novo usuário — cria com o UUID do Supabase
        user = new User
        {
            Id       = guid,
            Name     = name,
            Email    = email,
            Password = string.Empty,
            Role     = Role.CLIENT
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return BuildInfo(user);
    }

    /// <summary>
    /// Mantido para compatibilidade com GET /auth/me.
    /// Delega para SyncUserAsync.
    /// </summary>
    public Task<AuthResponse> GetOrCreateByEmailAsync(string supabaseId, string email, string name)
        => SyncUserAsync(supabaseId, email, name);

    // ─── Privado ─────────────────────────────────────────────────────────────

    /// <summary>
    /// Migra um usuário existente (fluxo antigo) para o UUID do Supabase.
    /// Deve ser chamado dentro de uma transação aberta.
    /// Cria a nova linha de usuário, move as dependências e remove a linha antiga.
    /// </summary>
    private async Task MigrateUserIdAsync(User oldUser, Guid newId, string email, string name)
    {
        var oldId = oldUser.Id;
        var tempEmail = $"{oldId}.migrating.{oldUser.Email}";

        // Libera o email único para a nova linha sem alterar a PK referenciada.
        await _db.Database.ExecuteSqlRawAsync(
            "UPDATE users SET \"Email\" = {0} WHERE \"Id\" = {1}", tempEmail, oldId);

        await _db.Database.ExecuteSqlRawAsync(
            "INSERT INTO users (\"Id\", \"Name\", \"Email\", \"Password\", \"Role\") VALUES ({0}, {1}, {2}, {3}, {4})",
            newId,
            name,
            email,
            oldUser.Password,
            oldUser.Role.ToString());

        // Tabelas dependentes
        await _db.Database.ExecuteSqlRawAsync(
            "UPDATE professional_profiles SET \"UserId\" = {0} WHERE \"UserId\" = {1}", newId, oldId);
        await _db.Database.ExecuteSqlRawAsync(
            "UPDATE favorites SET \"UserId\" = {0} WHERE \"UserId\" = {1}", newId, oldId);
        await _db.Database.ExecuteSqlRawAsync(
            "UPDATE \"Reviews\" SET \"ReviewerId\" = {0} WHERE \"ReviewerId\" = {1}", newId, oldId);
        await _db.Database.ExecuteSqlRawAsync(
            "UPDATE conversations SET \"ClientId\" = {0} WHERE \"ClientId\" = {1}", newId, oldId);
        await _db.Database.ExecuteSqlRawAsync(
            "UPDATE conversations SET \"ProfessionalId\" = {0} WHERE \"ProfessionalId\" = {1}", newId, oldId);
        await _db.Database.ExecuteSqlRawAsync(
            "UPDATE messages SET \"SenderId\" = {0} WHERE \"SenderId\" = {1}", newId, oldId);
        await _db.Database.ExecuteSqlRawAsync(
            "UPDATE user_settings SET \"UserId\" = {0} WHERE \"UserId\" = {1}", newId, oldId);
        await _db.Database.ExecuteSqlRawAsync(
            "UPDATE service_requests SET \"ClientId\" = {0} WHERE \"ClientId\" = {1}", newId, oldId);
        await _db.Database.ExecuteSqlRawAsync(
            "UPDATE service_requests SET \"ProfessionalId\" = {0} WHERE \"ProfessionalId\" = {1}", newId, oldId);

        await _db.Database.ExecuteSqlRawAsync(
            "DELETE FROM users WHERE \"Id\" = {0}", oldId);
    }

    private static AuthResponse BuildInfo(User user) =>
        new(
            Token:  string.Empty,
            UserId: user.Id,
            Name:   user.Name,
            Email:  user.Email,
            Role:   user.Role
        );
}
