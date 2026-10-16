using System.ComponentModel.DataAnnotations;

namespace DTOs;

public class DepartmentRequest
{
    [Required, StringLength(20)]
    public string DepartmentCode { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string DepartmentName { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }
}