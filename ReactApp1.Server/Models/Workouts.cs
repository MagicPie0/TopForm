using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations.Schema;

namespace asp.Server.Models
{
    public class Workouts
    {
        public int Id { get; set; }

        [Column("workout_data")]
        public string? WorkoutData { get; set; }
        
        [Column("workout_date")]
        public DateTime WorkoutDate { get; set; }
    }
}
