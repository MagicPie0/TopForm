using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using back_end.Data;
using Microsoft.AspNetCore.Authorization;

namespace asp.Server.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class GetWorkoutController : Controller
    {
        private readonly ApplicationDbContext _context;

        public GetWorkoutController(ApplicationDbContext context)
        {
            _context = context;
        }

        public class WorkoutDetails
        {
            public string ExerciseName { get; set; }
            public List<int> Weights { get; set; }
            public List<int> Reps { get; set; }
            public List<int> Sets { get; set; }
        }

        public class WorkoutItem
        {
            public WorkoutDetails WorkoutDetails { get; set; }
        }

        public class ParsedWorkout
        {
            public string ExerciseName { get; set; }
            public List<int> Weights { get; set; }
            public List<int> Reps { get; set; }
            public List<int> Sets { get; set; }
            public List<string> MuscleGroups { get; set; }
        }

        public static List<ParsedWorkout> ParseWorkoutData(string workoutData)
        {
            if (string.IsNullOrWhiteSpace(workoutData) || workoutData == "[]")
                return new List<ParsedWorkout>();

            try
            {
                using JsonDocument doc = JsonDocument.Parse(workoutData);
                var workouts = new List<ParsedWorkout>();

                foreach (JsonElement element in doc.RootElement.EnumerateArray())
                {
                    if (!element.TryGetProperty("workoutDetails", out var details))
                        continue;

                    var workout = new ParsedWorkout
                    {
                        ExerciseName = details.GetProperty("exerciseName").GetString() ?? "Unknown",
                        Weights = details.GetProperty("weights").EnumerateArray().Select(x => x.GetInt32()).ToList(),
                        Reps = details.GetProperty("reps").EnumerateArray().Select(x => x.GetInt32()).ToList(),
                        Sets = details.GetProperty("sets").EnumerateArray().Select(x => x.GetInt32()).ToList()
                    };

                    workouts.Add(workout);
                }

                return workouts;
            }
            catch (Exception ex) when (ex is JsonException or KeyNotFoundException)
            {
                Console.WriteLine($"JSON parsing error: {ex.Message}");
                return new List<ParsedWorkout>();
            }
        }


        [HttpGet("workouts")]
        public async Task<IActionResult> GetWorkoutByDate([FromQuery] string date)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized("Érvénytelen felhasználói azonosító.");

            if (!DateTime.TryParse(date, out var parsedDate))
                return BadRequest("Érvénytelen dátum formátum!");

            // Get all workout IDs for the current user
            var userWorkoutIds = await _context.UserActivity
                .Where(ua => ua.UserId == userId)
                .Select(ua => ua.WorkoutId)
                .ToListAsync();

            // Ensure the user has associated workouts
            if (!userWorkoutIds.Any())
                return NotFound("A felhasználónak nincs edzése erre a napra.");

            // Retrieve the workouts for the specified date
            var workouts = await _context.Workouts
                .Where(w => w.WorkoutDate.Date == parsedDate.Date && userWorkoutIds.Contains(w.Id))
                .ToListAsync();

            // If no workouts were found, return a NotFound response
            if (!workouts.Any())
                return NotFound("Nincs edzés erre a napra.");

            // Parse the workouts
            var parsedWorkouts = workouts.Select(w => new
            {
                w.Id,
                WorkoutDetails = ParseWorkoutData(w.WorkoutData),
                w.WorkoutDate
            });

            return Ok(parsedWorkouts);
        }

    }
}