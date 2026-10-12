using Data;
using DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace HRManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly IEmployeeRepository _repository;
    private readonly ILogger<EmployeesController> _logger;

    public EmployeesController(
        IEmployeeRepository repository,
        ILogger<EmployeesController> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search)
    {
        var employees = await _repository.GetAllAsync(search);
        return Ok(employees);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var employee = await _repository.GetByIdAsync(id);

        if (employee is null)
            return NotFound(new { message = "Employee not found." });

        return Ok(employee);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        EmployeeRequest request)
    {
        try
        {
            var employee = await _repository.CreateAsync(request);

            return CreatedAtAction(
                nameof(GetById),
                new { id = employee.EmployeeId },
                employee);
        }
        catch (SqlException ex) when (
            ex.Number is 2601 or 2627)
        {
            return Conflict(new
            {
                message = "Employee code or email already exists."
            });
        }
        catch (SqlException ex)
        {
            _logger.LogError(ex, "Database error creating employee.");
            return Problem(
                statusCode: 500,
                title: "Unable to create employee.");
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id, EmployeeRequest request)
    {
        try
        {
            var employee =
                await _repository.UpdateAsync(id, request);

            if (employee is null)
                return NotFound(new
                {
                    message = "Active employee not found."
                });

            return Ok(employee);
        }
        catch (SqlException ex) when (
            ex.Number is 2601 or 2627)
        {
            return Conflict(new
            {
                message = "Employee code or email already exists."
            });
        }
        catch (SqlException ex)
        {
            _logger.LogError(ex, "Database error updating employee.");
            return Problem(
                statusCode: 500,
                title: "Unable to update employee.");
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Deactivate(int id)
    {
        var success = await _repository.DeactivateAsync(id);

        if (!success)
            return NotFound(new
            {
                message = "Active employee not found."
            });

        return NoContent();
    }
}