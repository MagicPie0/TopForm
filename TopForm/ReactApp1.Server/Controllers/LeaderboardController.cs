using back_end.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace asp.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LeaderboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public LeaderboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("get-leaderboard-details")]
        public async Task<IActionResult> GetLeaderboardDetails()
        {
            var allUsers = await _context.Users
                .Select(u => new { u.Id, u.Username, u.ProfilePicture })
                .ToListAsync();

            var allRanks = await _context.Ranks.ToListAsync();
            var allMuscleGroups = await _context.MuscleGroups.ToListAsync();

            var allUserActivities = await _context.UserActivity.ToListAsync();

            var leaderboard = allUsers.Select(user =>
            {
                var userActivities = allUserActivities
                    .Where(ua => ua.UserId == user.Id)
                    .ToList();

                var workoutIds = userActivities.Select(ua => ua.WorkoutId).Distinct().ToList();

                var workouts = _context.Workouts
                    .Where(w => workoutIds.Contains(w.Id))
                    .ToList();

                var firstActivity = userActivities.FirstOrDefault();

                var rank = firstActivity != null
                    ? allRanks.FirstOrDefault(r => r.id == firstActivity.RanksID)
                    : null;

                var muscleGroup = firstActivity != null
                    ? allMuscleGroups.FirstOrDefault(mg => mg.id == firstActivity.MuscleGroupId)
                    : null;

                return new
                {
                    user.Id,
                    user.Username,
                    ProfilPic = user.ProfilePicture != null ? Convert.ToBase64String(user.ProfilePicture) : null, 
                    Workouts = workouts,
                    Rank = rank,
                    MuscleGroup = muscleGroup
                };
            }).ToList();

            return Ok(new
            {
                Leaderboard = leaderboard 
            });
        }
    }
}
