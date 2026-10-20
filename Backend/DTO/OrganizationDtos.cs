using System.ComponentModel.DataAnnotations;

namespace DTOs;

public class OrganizationRequest
{
    [Required]
    [StringLength(20)]
    public string OrganizationCode { get; set; } = string.Empty;

    [Required]
    [StringLength(150)]
    public string OrganizationName { get; set; } = string.Empty;

    [StringLength(50)]
    public string? RegistrationNumber { get; set; }

    [EmailAddress]
    [StringLength(150)]
    public string? Email { get; set; }

    [StringLength(30)]
    public string? Phone { get; set; }

    [StringLength(300)]
    public string? Address { get; set; }
}