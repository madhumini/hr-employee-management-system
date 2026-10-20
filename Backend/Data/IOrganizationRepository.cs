using DTOs;
using Models;

namespace Data;

public interface IOrganizationRepository
{
    Task<IEnumerable<Organization>> GetAllAsync(string? search);
    Task<Organization?> GetByIdAsync(int id);
    Task<Organization> CreateAsync(OrganizationRequest request);
    Task<Organization?> UpdateAsync(int id, OrganizationRequest request);
    Task<bool> DeactivateAsync(int id);
}