using Dapper;
using Data;
using DTOs;
using DTOs;
using Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace HRManagement.API.Data;

public class LeaveRepository : ILeaveRepository
{
    private readonly IConfiguration _configuration;

    public LeaveRepository(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    private SqlConnection CreateConnection()
    {
        return new SqlConnection(
            _configuration.GetConnectionString("DefaultConnection"));
    }

    public async Task<IEnumerable<LeaveTypeModel>> GetLeaveTypesAsync()
    {
        using var connection = CreateConnection();

        return await connection.QueryAsync<LeaveTypeModel>(
            "dbo.sp_LeaveType_GetAll",
            commandType: CommandType.StoredProcedure);
    }

    public async Task<IEnumerable<LeaveBalanceModel>> GetBalancesAsync(
        int employeeId, int year)
    {
        using var connection = CreateConnection();

        return await connection.QueryAsync<LeaveBalanceModel>(
            "dbo.sp_LeaveBalance_GetByEmployee",
            new { EmployeeId = employeeId, LeaveYear = year },
            commandType: CommandType.StoredProcedure);
    }

    public async Task<IEnumerable<LeaveRequestModel>> GetMyRequestsAsync(
        int employeeId)
    {
        using var connection = CreateConnection();

        return await connection.QueryAsync<LeaveRequestModel>(
            "dbo.sp_LeaveRequest_GetByEmployee",
            new { EmployeeId = employeeId },
            commandType: CommandType.StoredProcedure);
    }

    public async Task<IEnumerable<LeaveRequestModel>> GetAllRequestsAsync(
        string? status)
    {
        using var connection = CreateConnection();

        return await connection.QueryAsync<LeaveRequestModel>(
            "dbo.sp_LeaveRequest_GetAll",
            new { Status = status },
            commandType: CommandType.StoredProcedure);
    }

    public async Task<LeaveRequestModel> CreateRequestAsync(
        int employeeId, LeaveRequestCreateDto request)
    {
        using var connection = CreateConnection();

        return await connection.QuerySingleAsync<LeaveRequestModel>(
            "dbo.sp_LeaveRequest_Create",
            new
            {
                EmployeeId = employeeId,
                request.LeaveTypeId,
                StartDate = request.StartDate.Date,
                EndDate = request.EndDate.Date,
                Reason = request.Reason.Trim()
            },
            commandType: CommandType.StoredProcedure);
    }

    public async Task<bool> ReviewRequestAsync(
        int requestId, int reviewerUserId, LeaveReviewDto request)
    {
        using var connection = CreateConnection();

        var result = await connection.QuerySingleOrDefaultAsync(
            "dbo.sp_LeaveRequest_Review",
            new
            {
                LeaveRequestId = requestId,
                ReviewedByUserId = reviewerUserId,
                Decision = request.Decision,
                ReviewComment = request.ReviewComment
            },
            commandType: CommandType.StoredProcedure);

        return result is not null;
    }

    public async Task<bool> CancelRequestAsync(
        int requestId, int employeeId)
    {
        using var connection = CreateConnection();

        var rows = await connection.QuerySingleAsync<int>(
            "dbo.sp_LeaveRequest_Cancel",
            new
            {
                LeaveRequestId = requestId,
                EmployeeId = employeeId
            },
            commandType: CommandType.StoredProcedure);

        return rows > 0;
    }
}