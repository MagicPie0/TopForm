using back_end.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace asp.Server.Admin
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : Controller
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Optimized User endpoint with async queries
        [HttpGet("User")]
        public async Task<IActionResult> GetUserForAdmin()
        {
            // Asynchronously fetch all users data
            var userTable = await _context.Users.ToListAsync();
            return Ok(userTable);
        }

        // Optimized Workout endpoint with async queries
        [HttpGet("Workout")]
        public async Task<IActionResult> GetWorkoutForAdmin()
        {
            // Asynchronously fetch all workouts data
            var workoutTable = await _context.Workouts.ToListAsync();
            return Ok(workoutTable);
        }

        // Optimized Diet endpoint with async queries
        [HttpGet("Diet")]
        public async Task<IActionResult> GetDietForAdmin()
        {
            // Asynchronously fetch all diet data
            var dietTable = await _context.Diet.ToListAsync();
            return Ok(dietTable);
        }

        // Optimized MuscleGroups endpoint with async queries
        [HttpGet("MuscleGroups")]
        public async Task<IActionResult> GetMuscleGroupsForAdmin()
        {
            // Asynchronously fetch all muscle groups data
            var muscleGroupsTable = await _context.MuscleGroups.ToListAsync();
            return Ok(muscleGroupsTable);
        }

        // Optimized Ranks endpoint with async queries
        [HttpGet("Ranks")]
        public async Task<IActionResult> GetRanksForAdmin()
        {
            // Asynchronously fetch all ranks data
            var ranksTable = await _context.Ranks.ToListAsync();
            return Ok(ranksTable);
        }

        // Optimized UserActivity endpoint with async queries
        [HttpGet("UserActivity")]
        public async Task<IActionResult> GetUserActivityForAdmin()
        {
            // Asynchronously fetch all user activity data
            var userActivityTable = await _context.UserActivity.ToListAsync();
            return Ok(userActivityTable);
        }
    }
}
