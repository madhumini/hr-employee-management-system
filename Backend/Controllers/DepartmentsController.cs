using Data;
using DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace HRManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DepartmentsController : ControllerBase
{
    private readonly IDepartmentRepository _repository;
    private readonly ILogger<DepartmentsController> _logger;

    public DepartmentsController(
        IDepartmentRepository repository,
        ILogger<DepartmentsController> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search)
    {
        var departments = await _repository.GetAllAsync(search);
        return Ok(departments);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var department = await _repository.GetByIdAsync(id);

        if (department is null)
        {
            return NotFound(new
            {
                message = "Department not found."
            });
        }

        return Ok(department);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        DepartmentRequest request)
    {
        try
        {
            var department = await _repository.CreateAsync(request);

            return CreatedAtAction(
                nameof(GetById),
                new { id = department.DepartmentId },
                department);
        }
        catch (SqlException ex) when (
            ex.Number is 2601 or 2627)
        {
            return Conflict(new
            {
                message = "Department code or name already exists."
            });
        }
        catch (SqlException ex)
        {
            _logger.LogError(ex, "Error creating department.");

            return Problem(
                statusCode: 500,
                title: "Unable to create department.");
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        DepartmentRequest request)
    {
        try
        {
            var department =
                await _repository.UpdateAsync(id, request);

            if (department is null)
            {
                return NotFound(new
                {
                    message = "Active department not found."
                });
            }

            return Ok(department);
        }
        catch (SqlException ex) when (
            ex.Number is 2601 or 2627)
        {
            return Conflict(new
            {
                message = "Department code or name already exists."
            });
        }
        catch (SqlException ex)
        {
            _logger.LogError(ex, "Error updating department.");

            return Problem(
                statusCode: 500,
                title: "Unable to update department.");
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Deactivate(int id)
    {
        var success = await _repository.DeactivateAsync(id);

        if (!success)
        {
            return NotFound(new
            {
                message = "Active department not found."
            });
        }

        return NoContent();
    }
}