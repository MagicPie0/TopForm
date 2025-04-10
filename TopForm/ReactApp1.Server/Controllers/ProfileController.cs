using back_end.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Validations;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using static asp.Server.Controllers.GetWorkoutController;

namespace asp.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProfileController : Controller
    {
        private readonly ApplicationDbContext _context;

        public ProfileController(ApplicationDbContext context)
        {
            _context = context;
        }

        public static List<WorkoutExercise> ParseWorkoutData(string workoutData)
        {
            if (string.IsNullOrWhiteSpace(workoutData))
                return new List<WorkoutExercise>();

            try
            {
                using JsonDocument doc = JsonDocument.Parse(workoutData);
                var exercises = new List<WorkoutExercise>();

                foreach (var element in doc.RootElement.EnumerateArray())
                {
                    if (!element.TryGetProperty("workoutDetails", out var details))
                        continue;

                    var exerciseName = details.GetProperty("exerciseName").GetString() ?? "Unknown Exercise";
                    var weights = details.GetProperty("weights").EnumerateArray().Select(x => x.GetInt32()).ToList();
                    var maxWeight = weights.DefaultIfEmpty(0).Max();

                    exercises.Add(new WorkoutExercise
                    {
                        Name = exerciseName,
                        MaxWeight = maxWeight,
                    });
                }

                return exercises;
            }
            catch (Exception ex) when (ex is JsonException or KeyNotFoundException)
            {
                Console.WriteLine($"Error parsing workout data: {ex.Message}");
                return new List<WorkoutExercise>();
            }
        }

        public class WorkoutExercise
        {
            public string Name { get; set; }
            public int MaxWeight { get; set; }
        }

       

        [HttpGet("get-profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized("Érvénytelen felhasználói azonosító.");

            var user = await _context.Users
              .Where(u => u.Id == userId)
              .Select(u => new { u.Id, u.Username, u.ProfilePicture, u.Email, u.Name })
              .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new { Message = "User not found" });
            }

            var userActivityIds = await _context.UserActivity
                .Where(ua => ua.UserId == userId)
                .Select(ua => new { ua.RanksID, ua.MuscleGroupId})
                .FirstOrDefaultAsync();

            var workoutIds = await _context.UserActivity
                .Where(ua => ua.UserId == userId && ua.WorkoutId != null)
                .Select(ua => ua.WorkoutId.Value)
                .Distinct() 
                .ToListAsync();

            if (userActivityIds == null)
            {
                return NotFound(new { Message = "UserActivity IDs is not found" });
            }

            var muscleGroup = await _context.MuscleGroups
                .Where(m => m.id == userActivityIds.MuscleGroupId)
                .Select(m => new {m.name1, m.kg1, m.name2, m.kg2, m.name3, m.kg3, m.name4, m.kg4, m.date})
                .FirstOrDefaultAsync();
            
            var rank = await _context.Ranks
                .Where(r =>  r.id == userActivityIds.RanksID)
                .Select(r => new {r.rankName, r.points})
                .FirstOrDefaultAsync();

            var workouts = new List<object>();

            if (workoutIds.Any())
            {
                var workoutEntities = await _context.Workouts
                    .Where(w => workoutIds.Contains(w.Id))
                    .Select(w => new {
                        w.Id,
                        w.WorkoutData,
                        w.WorkoutDate
                    })
                    .OrderByDescending(w => w.WorkoutDate)
                    .ToListAsync();

                workouts = workoutEntities.Select(w => new
                {
                    Id = w.Id,
                    Date = w.WorkoutDate.ToString("yyyy-MM-dd"),
                    Exercises = ParseWorkoutData(w.WorkoutData)
                        .OrderByDescending(e => e.MaxWeight)
                        .ToList()
                }).Cast<object>().ToList();
            }

            var profile = new
            {
                User = new Dictionary<string, object?>
                {
                    ["Name"] = user.Name,
                    ["Username"] = user.Username,
                    ["Email"] = user.Email,
                    ["ProfilePicture"] = user.ProfilePicture
                },

                Muscles = new
                {
                    Groups = new[]
                    {
            new { Name = muscleGroup.name1, Kg = muscleGroup.kg1 },
            new { Name = muscleGroup.name2, Kg = muscleGroup.kg2 },
            new { Name = muscleGroup.name3, Kg = muscleGroup.kg3 },
            new { Name = muscleGroup.name4, Kg = muscleGroup.kg4 }
        },
                    Date = muscleGroup.date?.ToString("yyyy-MM-dd") ?? "N/A"
                },

                Workouts = workouts,

                Rank = rank != null
                    ? new Dictionary<string, object?>
                    {
                        ["Name"] = rank.rankName,
                        ["Points"] = rank.points
                    }
                    : null
            };

            return Ok(profile);

        }

    }
}
