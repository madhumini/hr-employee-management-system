using System.ComponentModel.DataAnnotations;

namespace DTOs;

public class EmployeeRequest
{
    [Required, StringLength(20)]
    public string EmployeeCode { get; set; } = string.Empty;

    [Required, StringLength(50)]
    public string FirstName { get; set; } = string.Empty;

    [Required, StringLength(50)]
    public string LastName { get; set; } = string.Empty;

    [Required, EmailAddress, StringLength(150)]
    public string Email { get; set; } = string.Empty;

    [StringLength(20)]
    public string? Phone { get; set; }

    public DateTime? DateOfBirth { get; set; }

    [StringLength(20)]
    public string? Gender { get; set; }

    [Required]
    public DateTime? HireDate { get; set; }

    [Required, StringLength(100)]
    public string JobTitle { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string Department { get; set; } = string.Empty;

    [Range(typeof(decimal), "0", "9999999999999999")]
    public decimal Salary { get; set; }
}