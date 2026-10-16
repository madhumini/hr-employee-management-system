using DTOs;
using Models;

namespace Data;

public interface IDepartmentRepository
{
    Task<IEnumerable<Department>> GetAllAsync(string? search);

    Task<Department?> GetByIdAsync(int id);

    Task<Department> CreateAsync(DepartmentRequest request);

    Task<Department?> UpdateAsync(
        int id,
        DepartmentRequest request);

    Task<bool> DeactivateAsync(int id);
}