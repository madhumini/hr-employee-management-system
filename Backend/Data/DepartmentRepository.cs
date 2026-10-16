using Dapper;
using DTOs;
using Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace Data;

public class DepartmentRepository : IDepartmentRepository
{
    private readonly string _connectionString;

    public DepartmentRepository(IConfiguration configuration)
    {
        _connectionString =
            configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "Database connection string is missing.");
    }

    private SqlConnection CreateConnection()
        => new SqlConnection(_connectionString);

    public async Task<IEnumerable<Department>> GetAllAsync(
        string? search)
    {
        using var connection = CreateConnection();

        return await connection.QueryAsync<Department>(
            "dbo.sp_Department_GetAll",
            new
            {
                Search = search,
                IncludeInactive = false
            },
            commandType: CommandType.StoredProcedure);
    }

    public async Task<Department?> GetByIdAsync(int id)
    {
        using var connection = CreateConnection();

        return await connection.QuerySingleOrDefaultAsync<Department>(
            "dbo.sp_Department_GetById",
            new { DepartmentId = id },
            commandType: CommandType.StoredProcedure);
    }

    public async Task<Department> CreateAsync(
        DepartmentRequest request)
    {
        using var connection = CreateConnection();

        return await connection.QuerySingleAsync<Department>(
            "dbo.sp_Department_Insert",
            new
            {
                DepartmentCode = request.DepartmentCode.Trim(),
                DepartmentName = request.DepartmentName.Trim(),
                Description = request.Description
            },
            commandType: CommandType.StoredProcedure);
    }

    public async Task<Department?> UpdateAsync(
        int id,
        DepartmentRequest request)
    {
        using var connection = CreateConnection();

        return await connection.QuerySingleOrDefaultAsync<Department>(
            "dbo.sp_Department_Update",
            new
            {
                DepartmentId = id,
                DepartmentCode = request.DepartmentCode.Trim(),
                DepartmentName = request.DepartmentName.Trim(),
                Description = request.Description
            },
            commandType: CommandType.StoredProcedure);
    }

    public async Task<bool> DeactivateAsync(int id)
    {
        using var connection = CreateConnection();

        var rowsAffected = await connection.QuerySingleAsync<int>(
            "dbo.sp_Department_Deactivate",
            new { DepartmentId = id },
            commandType: CommandType.StoredProcedure);

        return rowsAffected > 0;
    }
}