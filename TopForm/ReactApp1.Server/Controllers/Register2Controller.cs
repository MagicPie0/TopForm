using Microsoft.AspNetCore.Mvc;
using back_end.Data;
using Microsoft.EntityFrameworkCore;
using asp.Server.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Linq;
using System;
using Microsoft.AspNetCore.Mvc.Rendering;
[ApiController]
[Authorize]
[Route("api/Registration")]
public class Registration2Controller : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public Registration2Controller(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost("update-user-muscles")]
    [Authorize]
    public async Task<IActionResult> UpdateUserAndAddMuscleGroups([FromBody] UpdateRequest request)
    {
        if (request == null || request.MuscleGroups == null || !request.MuscleGroups.Any())
        {
            return BadRequest(new { message = "Invalid request: MuscleGroups is required.", status = 400 });
        }

        var userIdFromToken = User.FindFirst("UserId")?.Value;

        if (string.IsNullOrEmpty(userIdFromToken))
        {
            return Unauthorized(new { message = "User is not authenticated.", status = 401 });
        }

        int userId = int.Parse(userIdFromToken);

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
        {
            return NotFound(new { message = "User not found.", status = 404 });
        }

        using (var transaction = await _context.Database.BeginTransactionAsync())
        {
            try
            {
                user.Men = request.Men;
                await _context.SaveChangesAsync();

                DateTime dateTime = DateTime.Now;
                var muscleGroup = new MuscleGroup
                {
                    name1 = request.MuscleGroups.Count > 0 ? request.MuscleGroups[0].Name : null,
                    kg1 = request.MuscleGroups.Count > 0 ? request.MuscleGroups[0].Kg : 0,
                    name2 = request.MuscleGroups.Count > 1 ? request.MuscleGroups[1].Name : null,
                    kg2 = request.MuscleGroups.Count > 1 ? request.MuscleGroups[1].Kg : 0,
                    name3 = request.MuscleGroups.Count > 2 ? request.MuscleGroups[2].Name : null,
                    kg3 = request.MuscleGroups.Count > 2 ? request.MuscleGroups[2].Kg : 0,
                    name4 = request.MuscleGroups.Count > 3 ? request.MuscleGroups[3].Name : null,
                    kg4 = request.MuscleGroups.Count > 3 ? request.MuscleGroups[3].Kg : 0,
                    date = dateTime
                };

                _context.MuscleGroups.Add(muscleGroup);
                await _context.SaveChangesAsync();

                var existingUserActivity = await _context.UserActivity
                    .FirstOrDefaultAsync(ua => ua.UserId == userId);

                if (existingUserActivity != null)
                {
                    existingUserActivity.MuscleGroupId = muscleGroup.id;
                    _context.UserActivity.Update(existingUserActivity);
                }

                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return Ok(new { message = "User and muscle groups updated successfully." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"ERROR: {ex.InnerException?.Message ?? ex.Message}");
                return StatusCode(500, new { message = $"Error: {ex.InnerException?.Message ?? ex.Message}", status = 500 });
            }
        }
    }
}

public class UpdateRequest
{
    public int user_id { get; set; }
    public byte Men { get; set; }
    public List<MuscleGroupRequest> MuscleGroups { get; set; }
}

public class MuscleGroupRequest
{
    public string Name { get; set; }
    public int Kg { get; set; }
}