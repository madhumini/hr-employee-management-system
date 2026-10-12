using System.Data;
using Dapper;
using DTOs;
using Models;
using Microsoft.Data.SqlClient;

namespace Data;

public class EmployeeRepository : IEmployeeRepository
{
    private readonly string _connectionString;

    public EmployeeRepository(IConfiguration configuration)
    {
        _connectionString =
            configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "Database connection string is missing.");
    }

    private SqlConnection CreateConnection()
        => new SqlConnection(_connectionString);

    public async Task<IEnumerable<Employee>> GetAllAsync(
        string? search)
    {
        using var connection = CreateConnection();

        return await connection.QueryAsync<Employee>(
            "dbo.sp_Employee_GetAll",
            new { Search = search, IncludeInactive = false },
            commandType: CommandType.StoredProcedure);
    }

    public async Task<Employee?> GetByIdAsync(int id)
    {
        using var connection = CreateConnection();

        return await connection.QuerySingleOrDefaultAsync<Employee>(
            "dbo.sp_Employee_GetById",
            new { EmployeeId = id },
            commandType: CommandType.StoredProcedure);
    }

    public async Task<Employee> CreateAsync(EmployeeRequest request)
    {
        using var connection = CreateConnection();

        var employee = await connection.QuerySingleAsync<Employee>(
            "dbo.sp_Employee_Insert",
            new
            {
                request.EmployeeCode,
                request.FirstName,
                request.LastName,
                request.Email,
                request.Phone,
                request.DateOfBirth,
                request.Gender,
                HireDate = request.HireDate!.Value,
                request.JobTitle,
                request.Department,
                request.Salary
            },
            commandType: CommandType.StoredProcedure);

        return employee;
    }

    public async Task<Employee?> UpdateAsync(
        int id, EmployeeRequest request)
    {
        using var connection = CreateConnection();

        return await connection.QuerySingleOrDefaultAsync<Employee>(
            "dbo.sp_Employee_Update",
            new
            {
                EmployeeId = id,
                request.EmployeeCode,
                request.FirstName,
                request.LastName,
                request.Email,
                request.Phone,
                request.DateOfBirth,
                request.Gender,
                HireDate = request.HireDate!.Value,
                request.JobTitle,
                request.Department,
                request.Salary
            },
            commandType: CommandType.StoredProcedure);
    }

    public async Task<bool> DeactivateAsync(int id)
    {
        using var connection = CreateConnection();

        var result = await connection.QuerySingleAsync<int>(
            "dbo.sp_Employee_Deactivate",
            new { EmployeeId = id },
            commandType: CommandType.StoredProcedure);

        return result > 0;
    }
}