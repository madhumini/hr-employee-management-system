using Dapper;
using Data;
using Microsoft.Data.SqlClient;
using Models;
using System.Data;

namespace Data;

public class AuthRepository : IAuthRepository
{
    private readonly IConfiguration _configuration;

    public AuthRepository(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<AuthUser?> GetByEmailAsync(string email)
    {
        var connectionString =
            _configuration.GetConnectionString("DefaultConnection");

        await using var connection = new SqlConnection(connectionString);

        return await connection.QuerySingleOrDefaultAsync<AuthUser>(
            "dbo.sp_User_GetByEmail",
            new { Email = email.Trim().ToLowerInvariant() },
            commandType: CommandType.StoredProcedure);
    }
}