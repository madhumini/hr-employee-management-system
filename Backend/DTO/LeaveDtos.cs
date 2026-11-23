using System.ComponentModel.DataAnnotations;

namespace DTOs;

public class LeaveRequestCreateDto
{
    [Range(1, int.MaxValue)]
    public int LeaveTypeId { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    [Required]
    [StringLength(500, MinimumLength = 3)]
    public string Reason { get; set; } = string.Empty;
}

public class LeaveReviewDto
{
    [Required]
    public string Decision { get; set; } = string.Empty;

    [StringLength(500)]
    public string? ReviewComment { get; set; }
}

public class LeaveRequestModel
{
    public int LeaveRequestId { get; set; }
    public int EmployeeId { get; set; }
    public string? EmployeeCode { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public int LeaveTypeId { get; set; }
    public string LeaveTypeName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalDays { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? ReviewComment { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
}

public class LeaveTypeModel
{
    public int LeaveTypeId { get; set; }
    public string LeaveTypeName { get; set; } = string.Empty;
    public decimal AnnualAllowance { get; set; }
}

public class LeaveBalanceModel
{
    public int LeaveBalanceId { get; set; }
    public int EmployeeId { get; set; }
    public int LeaveTypeId { get; set; }
    public string LeaveTypeName { get; set; } = string.Empty;
    public int LeaveYear { get; set; }
    public decimal AllocatedDays { get; set; }
    public decimal UsedDays { get; set; }
    public decimal RemainingDays { get; set; }
}