using DTOs;
using HRManagement.API.DTOs;
using Models;

namespace Data;

public interface ILeaveRepository
{
    Task<IEnumerable<LeaveTypeModel>> GetLeaveTypesAsync();

    Task<IEnumerable<LeaveBalanceModel>> GetBalancesAsync(
        int employeeId, int year);

    Task<IEnumerable<LeaveRequestModel>> GetMyRequestsAsync(
        int employeeId);

    Task<IEnumerable<LeaveRequestModel>> GetAllRequestsAsync(
        string? status);

    Task<LeaveRequestModel> CreateRequestAsync(
        int employeeId, LeaveRequestCreateDto request);

    Task<bool> ReviewRequestAsync(
        int requestId, int reviewerUserId, LeaveReviewDto request);

    Task<bool> CancelRequestAsync(int requestId, int employeeId);
}