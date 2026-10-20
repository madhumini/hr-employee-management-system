namespace Models;

public class Organization
{
    public int OrganizationId { get; set; }
    public string OrganizationCode { get; set; } = string.Empty;
    public string OrganizationName { get; set; } = string.Empty;
    public string? RegistrationNumber { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}