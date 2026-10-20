using Dapper;
using DTOs;
using Microsoft.Data.SqlClient;
using Models;
using System.Data;

namespace Data;

public class OrganizationRepository : IOrganizationRepository
{
    private readonly IConfiguration _configuration;

    public OrganizationRepository(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    private SqlConnection CreateConnection()
    {
        return new SqlConnection(
            _configuration.GetConnectionString("DefaultConnection"));
    }

    public async Task<IEnumerable<Organization>> GetAllAsync(string? search)
    {
        using var connection = CreateConnection();

        return await connection.QueryAsync<Organization>(
            "dbo.sp_Organization_GetAll",
            new { Search = search },
            commandType: CommandType.StoredProcedure);
    }

    public async Task<Organization?> GetByIdAsync(int id)
    {
        using var connection = CreateConnection();

        return await connection.QuerySingleOrDefaultAsync<Organization>(
            "dbo.sp_Organization_GetById",
            new { OrganizationId = id },
            commandType: CommandType.StoredProcedure);
    }

    public async Task<Organization> CreateAsync(
        OrganizationRequest request)
    {
        using var connection = CreateConnection();

        return await connection.QuerySingleAsync<Organization>(
            "dbo.sp_Organization_Insert",
            new
            {
                OrganizationCode = request.OrganizationCode.Trim(),
                OrganizationName = request.OrganizationName.Trim(),
                RegistrationNumber = request.RegistrationNumber,
                Email = request.Email,
                Phone = request.Phone,
                Address = request.Address
            },
            commandType: CommandType.StoredProcedure);
    }

    public async Task<Organization?> UpdateAsync(
        int id,
        OrganizationRequest request)
    {
        using var connection = CreateConnection();

        return await connection.QuerySingleOrDefaultAsync<Organization>(
            "dbo.sp_Organization_Update",
            new
            {
                OrganizationId = id,
                OrganizationCode = request.OrganizationCode.Trim(),
                OrganizationName = request.OrganizationName.Trim(),
                RegistrationNumber = request.RegistrationNumber,
                Email = request.Email,
                Phone = request.Phone,
                Address = request.Address
            },
            commandType: CommandType.StoredProcedure);
    }

    public async Task<bool> DeactivateAsync(int id)
    {
        using var connection = CreateConnection();

        var result = await connection.QuerySingleAsync<int>(
            "dbo.sp_Organization_Deactivate",
            new { OrganizationId = id },
            commandType: CommandType.StoredProcedure);

        return result > 0;
    }
}