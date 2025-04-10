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

        [HttpGet("User")]
        public async Task<IActionResult> GetUserForAdmin()
        {
            var userTable = await _context.Users.ToListAsync();
            return Ok(userTable);
        }

        [HttpGet("Workout")]
        public async Task<IActionResult> GetWorkoutForAdmin()
        {
            var workoutTable = await _context.Workouts.ToListAsync();
            return Ok(workoutTable);
        }

        [HttpGet("Diet")]
        public async Task<IActionResult> GetDietForAdmin()
        {
            var dietTable = await _context.Diet.ToListAsync();
            return Ok(dietTable);
        }

        [HttpGet("MuscleGroups")]
        public async Task<IActionResult> GetMuscleGroupsForAdmin()
        {
            var muscleGroupsTable = await _context.MuscleGroups.ToListAsync();
            return Ok(muscleGroupsTable);
        }

        [HttpGet("Ranks")]
        public async Task<IActionResult> GetRanksForAdmin()
        {
            var ranksTable = await _context.Ranks.ToListAsync();
            return Ok(ranksTable);
        }

        [HttpGet("UserActivity")]
        public async Task<IActionResult> GetUserActivityForAdmin()
        {
            var userActivityTable = await _context.UserActivity.ToListAsync();
            return Ok(userActivityTable);
        }
    }
}
