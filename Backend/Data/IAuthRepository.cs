using Models;

namespace Data;

public interface IAuthRepository
{
    Task<AuthUser?> GetByEmailAsync(string email);
}