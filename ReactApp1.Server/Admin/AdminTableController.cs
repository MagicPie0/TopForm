using back_end.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
            var userTable = _context.Users.ToList();

            return Ok(userTable);
        }

        [HttpGet("Workout")]
        public async Task<IActionResult> GetWorkoutForAdmin()
        {
            var workoutTable = _context.Workouts.ToList();

            return Ok(workoutTable);
        }

        [HttpGet("Diet")]
        public async Task<IActionResult> GetDietForAdmin()
        {
            var dietTable = _context.Diet.ToList();

            return Ok(dietTable);
        }

        [HttpGet("MuscleGroups")]
        public async Task<IActionResult> GetMuscleGroupsForAdmin()
        {
            var muscleGroupsTable = _context.MuscleGroups.ToList();

            return Ok(muscleGroupsTable);
        }

        [HttpGet("Ranks")]
        public async Task<IActionResult> GetRanksForAdmin()
        {
            var ranksTable = _context.Ranks.ToList();

            return Ok(ranksTable);
        }

        [HttpGet("UserActivity")]
        public async Task<IActionResult> GetUserActivityForAdmin()
        {
            var userActivityTable = _context.UserActivity.ToList();

            return Ok(userActivityTable);
        }

    }
}
