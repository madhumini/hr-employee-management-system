using Data;
using DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Models;

namespace Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrganizationsController : ControllerBase
{
    private readonly IOrganizationRepository _repository;
    private readonly ILogger<OrganizationsController> _logger;

    public OrganizationsController(
        IOrganizationRepository repository,
        ILogger<OrganizationsController> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Organization>>> GetAll(
        [FromQuery] string? search)
    {
        try
        {
            return Ok(await _repository.GetAllAsync(search));
        }
        catch (SqlException ex)
        {
            _logger.LogError(ex, "Failed to retrieve organizations.");
            return Problem("Unable to retrieve organizations.");
        }
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Organization>> GetById(int id)
    {
        try
        {
            var organization = await _repository.GetByIdAsync(id);

            if (organization is null)
                return NotFound(new { message = "Organization not found." });

            return Ok(organization);
        }
        catch (SqlException ex)
        {
            _logger.LogError(ex, "Failed to retrieve organization {Id}.", id);
            return Problem("Unable to retrieve the organization.");
        }
    }

    [HttpPost]
    public async Task<ActionResult<Organization>> Create(
        OrganizationRequest request)
    {
        try
        {
            var organization = await _repository.CreateAsync(request);

            return CreatedAtAction(
                nameof(GetById),
                new { id = organization.OrganizationId },
                organization);
        }
        catch (SqlException ex) when (ex.Number is 2601 or 2627)
        {
            return Conflict(new
            {
                message = "Organization code or registration number already exists."
            });
        }
        catch (SqlException ex)
        {
            _logger.LogError(ex, "Failed to create organization.");
            return Problem("Unable to create the organization.");
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<Organization>> Update(
        int id,
        OrganizationRequest request)
    {
        try
        {
            var organization = await _repository.UpdateAsync(id, request);

            if (organization is null)
                return NotFound(new
                {
                    message = "Organization not found or inactive."
                });

            return Ok(organization);
        }
        catch (SqlException ex) when (ex.Number is 2601 or 2627)
        {
            return Conflict(new
            {
                message = "Organization code or registration number already exists."
            });
        }
        catch (SqlException ex)
        {
            _logger.LogError(ex, "Failed to update organization {Id}.", id);
            return Problem("Unable to update the organization.");
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Deactivate(int id)
    {
        try
        {
            var deactivated = await _repository.DeactivateAsync(id);

            if (!deactivated)
                return NotFound(new
                {
                    message = "Organization not found or already inactive."
                });

            return NoContent();
        }
        catch (SqlException ex)
        {
            _logger.LogError(ex, "Failed to deactivate organization {Id}.", id);
            return Problem("Unable to deactivate the organization.");
        }
    }
}