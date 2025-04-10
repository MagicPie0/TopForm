using asp.Server.Models;
using back_end.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace back_end.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class WorkoutsController : ControllerBase
    {                                                                                                                                               
        private readonly ApplicationDbContext _context;


        public WorkoutsController(ApplicationDbContext context)
        {
            _context = context;
        }
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> PostWorkout([FromBody] WorkoutRequest request)
        {
            if (request == null ||
                request.WorkoutNames == null || !request.WorkoutNames.Any() ||
                request.WeightsKg == null || !request.WeightsKg.Any() ||
                request.Reps == null || !request.Reps.Any() ||
                request.Sets == null || !request.Sets.Any())
            {
                return BadRequest(new { message = "Invalid request: All fields are required.", status = 400 });
            }

            var userIdFromToken = User.FindFirst("UserId")?.Value;

            if (string.IsNullOrEmpty(userIdFromToken))
            {
                return Unauthorized(new { message = "User is not authenticated.", status = 401 });
            }

            int userId = int.Parse(userIdFromToken);

            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var workouts = new List<object>();
                    int weightIndex = 0;
                    int repIndex = 0;

                    for (int i = 0; i < request.WorkoutNames.Count; i++)
                    {
                        var exerciseName = request.WorkoutNames[i];
                        int sets = int.Parse(request.Sets[i]);

                        var weights = request.WeightsKg
                            .Skip(weightIndex)
                            .Take(sets)
                            .Select(int.Parse)
                            .ToList();

                        var reps = request.Reps
                            .Skip(repIndex)
                            .Take(sets)
                            .Select(int.Parse)
                            .ToList();

                        weightIndex += sets;
                        repIndex += sets;

                        var workoutDetail = new
                        {
                            exerciseName,
                            weights = weights,
                            reps = reps,
                            sets = new List<int> { sets }
                        };

                        workouts.Add(new
                        {
                            workoutDetails = workoutDetail,
                        });
                    }

                    var workoutData = System.Text.Json.JsonSerializer.Serialize(workouts);

                    var workout = new Workouts
                    {
                        WorkoutData = workoutData,
                        WorkoutDate = DateTime.UtcNow.Date
                    };

                    _context.Workouts.Add(workout);
                    await _context.SaveChangesAsync();


                    var calculationRequest = new WorkoutCalculationRequest
                    {
                        Kg = request.WeightsKg,
                        Reps = request.Reps,
                        Sets = request.Sets
                    };
                    var (points, name) = CalculatePointsAndName(calculationRequest);
                    Ranks newRank = null;

                    var existingRank = await _context.UserActivity
                        .FirstOrDefaultAsync(ua => ua.UserId == userId && ua.RanksID != null);

                    if (existingRank != null)
                    {
                        var rankRecord = await _context.Ranks
                            .FirstOrDefaultAsync(r => r.id == existingRank.RanksID);

                        if (rankRecord != null)
                        {
                            rankRecord.points += points;
                            rankRecord.rankName = GetNameBasedOnPoints(rankRecord.points); 

                            _context.Ranks.Update(rankRecord);
                        }
                    }
                    else
                    {
                         newRank = new Ranks
                        {
                            points = points,
                            rankName = name
                        };

                        _context.Ranks.Add(newRank);
                        await _context.SaveChangesAsync(); 

                        var existingRanksActivity = await _context.UserActivity
                            .FirstOrDefaultAsync(ua => ua.UserId == userId && ua.RanksID == null);

                        if (existingRanksActivity != null)
                        {
                            existingRanksActivity.RanksID = newRank.id;
                            _context.UserActivity.Update(existingRanksActivity);    
                        }
                    }


                    await _context.SaveChangesAsync();

                    var existingUserActivity = await _context.UserActivity
                        .FirstOrDefaultAsync(ua => ua.UserId == userId && ua.WorkoutId == null);

                    if (existingUserActivity != null)
                    {
                        existingUserActivity.WorkoutId = workout.Id;
                        _context.UserActivity.Update(existingUserActivity);
                    }
                    else
                    {
                        var existingRecord = await _context.UserActivity
                            .FirstOrDefaultAsync(ua => ua.UserId == userId && ua.MuscleGroupId != null && ua.WorkoutId != null);

                        int? muscleGroupId = null;

                        if (existingRecord != null)
                        {
                            muscleGroupId = existingRecord.MuscleGroupId;
                        }

                        var existingUserRanksId = await _context.UserActivity
                            .FirstOrDefaultAsync(ua => ua.UserId == userId);

                        var savedRank = newRank?.id ?? existingUserRanksId?.RanksID;


                        var userActivity = new user_activity
                        {
                            UserId = userId,
                            MuscleGroupId = muscleGroupId,
                            WorkoutId = workout.Id,
                            RanksID = savedRank 
                        };


                        await _context.UserActivity.AddAsync(userActivity);
                    }

                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();

                    return Ok(new { message = "Workout and user_activity saved successfully.", status = 200 });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine($"ERROR: {ex.InnerException?.Message ?? ex.Message}");
                    return StatusCode(500, "An error occurred while saving the workout.");
                }

            }


        }

        [ApiExplorerSettings(IgnoreApi = true)]
        public (int Points, string Name) CalculatePointsAndName([FromBody] WorkoutCalculationRequest request)
        {
            int totalPoints = 0;

            for (int i = 0; i < request.Kg.Count && i < request.Reps.Count && i < request.Sets.Count; i++)
            {
                var weights = request.Kg[i].Split(',').Select(int.Parse).ToList();
                var reps = request.Reps[i].Split(',').Select(int.Parse).ToList();
                var sets = int.Parse(request.Sets[i]);

                int availableSets = Math.Min(weights.Count, reps.Count);
                int actualSets = Math.Min(availableSets, sets);

                for (int j = 0; j < actualSets; j++)
                {
                    totalPoints += weights[j] * reps[j];
                }
            }

            string name = GetNameBasedOnPoints(totalPoints);
            return (totalPoints, name);
        }

        public class WorkoutCalculationRequest
        {
            public List<string> Kg { get; set; }
            public List<string> Reps { get; set; }
            public List<string> Sets { get; set; }
        }


        private string GetNameBasedOnPoints(int points)
        {
            if (points >= 10000000) return "Titan";
            if (points >= 3000000) return "Champion";
            if (points >= 800000) return "Master";
            if (points >= 600000) return "Legend";
            if (points >= 200000) return "Elite";
            if (points >= 50000) return "Pro";
            if (points >= 20000) return "Advanced";
            if (points >= 5000) return "Intermediate";
            return "Beginner";
        }

    }


    public class WorkoutRequest
    {
        public List<string>? WorkoutNames { get; set; }
        public List<string>? WeightsKg { get; set; } 
        public List<string>? Reps { get; set; } 
        public List<string>? Sets { get; set; }
    }
}