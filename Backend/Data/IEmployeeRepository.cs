using DTOs;
using Models;

namespace Data;

public interface IEmployeeRepository
{
    Task<IEnumerable<Employee>> GetAllAsync(string? search);

    Task<Employee?> GetByIdAsync(int id);

    Task<Employee> CreateAsync(EmployeeRequest request);

    Task<Employee?> UpdateAsync(int id, EmployeeRequest request);

    Task<bool> DeactivateAsync(int id);
}