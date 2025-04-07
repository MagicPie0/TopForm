using back_end.Data;
using back_end.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestPlatform.CommunicationUtilities;
using Newtonsoft.Json.Linq;

namespace asp.Server.Admin
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminUserTableController : Controller
    {
        private readonly ApplicationDbContext _context;

        public AdminUserTableController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                var userExists = await _context.Users.AnyAsync(u => u.Id == id);
                if (!userExists)
                {
                    return NotFound(new { message = "User not found", status = 404 });
                }

                using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
                    var activities = await _context.UserActivity
                        .Where(ua => ua.UserId == id)
                        .ToListAsync();

                    var workoutIds = activities.Where(a => a.WorkoutId != null).Select(a => a.WorkoutId!.Value).Distinct().ToList();
                    var dietIds = activities.Where(a => a.DietId != null).Select(a => a.DietId!.Value).Distinct().ToList();
                    var ranksIds = activities.Where(a => a.RanksID != null).Select(a => a.RanksID!.Value).Distinct().ToList();
                    var muscleGroupIds = activities.Where(a => a.MuscleGroupId != null).Select(a => a.MuscleGroupId!.Value).Distinct().ToList();

                    // Nyers SQL törlés: megbízhatóbb, nincs EF tracking
                    if (workoutIds.Any())
                    {
                        await _context.Database.ExecuteSqlRawAsync($"DELETE FROM Workouts WHERE Id IN ({string.Join(",", workoutIds)})");
                    }

                    if (dietIds.Any())
                    {
                        await _context.Database.ExecuteSqlRawAsync($"DELETE FROM Diet WHERE Id IN ({string.Join(",", dietIds)})");
                    }

                    if (ranksIds.Any())
                    {
                        await _context.Database.ExecuteSqlRawAsync($"DELETE FROM Ranks WHERE id IN ({string.Join(",", ranksIds)})");
                    }

                    if (muscleGroupIds.Any())
                    {
                        await _context.Database.ExecuteSqlRawAsync($"DELETE FROM muscle_groups WHERE id IN ({string.Join(",", muscleGroupIds)})");
                    }

                    // UserActivity törlése SQL-lel
                    await _context.Database.ExecuteSqlRawAsync($"DELETE FROM user_activity WHERE user_id = {id}");

                    // Felhasználó törlése SQL-lel
                    await _context.Database.ExecuteSqlRawAsync($"DELETE FROM Users WHERE Id = {id}");

                    await transaction.CommitAsync();
                    return Ok(new { message = "User and related records deleted successfully", status = 200 });
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Something went wrong during deletion",
                    error = ex.Message,
                    status = 500
                });
            }
        }


        public class UserUpdateDTO
        {
            public string Username { get; set; }
            public string Email { get; set; }
            public string Name { get; set; }
            public int Men { get; set; } // 0 - férfi, 1 - nő
        }


        [HttpPut("User/{id}")]
        public async Task<IActionResult> UpdateUserByID(int id, [FromBody] UserUpdateDTO updatedUser)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound(new { message = "The user was not found", status = 404 });
            }

            user.Username = updatedUser.Username;
            user.Email = updatedUser.Email;
            user.Name = updatedUser.Name;
            user.Men = (byte)updatedUser.Men;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Update was successful", status = 200 });
        }


    }
}
