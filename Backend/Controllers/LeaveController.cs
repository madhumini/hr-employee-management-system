using Data;
using DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Security.Claims;

namespace HRManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LeaveController : ControllerBase
{
    private readonly ILeaveRepository _repository;
    private readonly ILogger<LeaveController> _logger;

    public LeaveController(
        ILeaveRepository repository,
        ILogger<LeaveController> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    private int? CurrentUserId =>
        int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id)
            ? id
            : null;

    private int? CurrentEmployeeId =>
        int.TryParse(User.FindFirstValue("EmployeeId"), out var id)
            ? id
            : null;

    [HttpGet("types")]
    public async Task<IActionResult> GetTypes()
    {
        return Ok(await _repository.GetLeaveTypesAsync());
    }

    [HttpGet("my-balances")]
    [Authorize(Roles = "Employee,HR")]
    public async Task<IActionResult> GetMyBalances(
        [FromQuery] int? year)
    {
        var employeeId = CurrentEmployeeId;

        if (employeeId is null)
            return Forbid();

        var leaveYear = year ?? DateTime.UtcNow.Year;

        return Ok(await _repository.GetBalancesAsync(
            employeeId.Value, leaveYear));
    }

    [HttpGet("my-requests")]
    [Authorize(Roles = "Employee,HR")]
    public async Task<IActionResult> GetMyRequests()
    {
        var employeeId = CurrentEmployeeId;

        if (employeeId is null)
            return Forbid();

        return Ok(await _repository.GetMyRequestsAsync(employeeId.Value));
    }

    [HttpPost("requests")]
    [Authorize(Roles = "Employee,HR")]
    public async Task<IActionResult> CreateRequest(
        LeaveRequestCreateDto request)
    {
        var employeeId = CurrentEmployeeId;

        if (employeeId is null)
            return Forbid();

        if (request.StartDate.TimeOfDay != TimeSpan.Zero ||
            request.EndDate.TimeOfDay != TimeSpan.Zero)
        {
            return BadRequest(new
            {
                message = "Please provide valid leave dates."
            });
        }

        if (request.EndDate.Date < request.StartDate.Date)
        {
            return BadRequest(new
            {
                message = "End date cannot be before start date."
            });
        }

        try
        {
            var created = await _repository.CreateRequestAsync(
                employeeId.Value, request);

            return Ok(created);
        }
        catch (SqlException ex) when (ex.Number == 50000 ||
                                       ex.Number == 50001 ||
                                       ex.Number == 50002 ||
                                       ex.Number == 50003 ||
                                       ex.Number == 50004 ||
                                       ex.Number == 50005 ||
                                       ex.Number == 50006 ||
                                       ex.Number == 50007 ||
                                       ex.Number == 50008)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (SqlException ex)
        {
            _logger.LogError(ex, "Unable to create leave request.");
            return Problem("Unable to submit the leave request.");
        }
    }

    [HttpGet("requests")]
    [Authorize(Roles = "HR")]
    public async Task<IActionResult> GetAllRequests(
        [FromQuery] string? status)
    {
        var validStatuses = new[]
        {
            "Pending", "Approved", "Rejected", "Cancelled"
        };

        if (!string.IsNullOrWhiteSpace(status) &&
            !validStatuses.Contains(status, StringComparer.OrdinalIgnoreCase))
        {
            return BadRequest(new { message = "Invalid status filter." });
        }

        return Ok(await _repository.GetAllRequestsAsync(status));
    }

    [HttpPut("requests/{id:int}/review")]
    [Authorize(Roles = "HR")]
    public async Task<IActionResult> ReviewRequest(
        int id, LeaveReviewDto request)
    {
        var reviewerUserId = CurrentUserId;

        if (reviewerUserId is null)
            return Forbid();

        if (request.Decision is not ("Approved" or "Rejected"))
        {
            return BadRequest(new
            {
                message = "Decision must be Approved or Rejected."
            });
        }

        try
        {
            var updated = await _repository.ReviewRequestAsync(
                id, reviewerUserId.Value, request);

            if (!updated)
                return NotFound(new { message = "Leave request not found." });

            return Ok(new { message = "Leave request reviewed successfully." });
        }
        catch (SqlException ex) when (ex.Number >= 50000)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (SqlException ex)
        {
            _logger.LogError(ex, "Unable to review leave request {Id}.", id);
            return Problem("Unable to review the leave request.");
        }
    }

    [HttpPut("requests/{id:int}/cancel")]
    [Authorize(Roles = "Employee,HR")]
    public async Task<IActionResult> CancelRequest(int id)
    {
        var employeeId = CurrentEmployeeId;

        if (employeeId is null)
            return Forbid();

        var cancelled = await _repository.CancelRequestAsync(
            id, employeeId.Value);

        if (!cancelled)
        {
            return BadRequest(new
            {
                message = "Only your own pending requests can be cancelled."
            });
        }

        return NoContent();
    }
}