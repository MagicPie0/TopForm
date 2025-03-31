using back_end.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace asp.Server.Models
{
    [Table("user_activity")]
    public class user_activity
    {
        public int id { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [Column("muscle_group_id")]
        public int? MuscleGroupId { get; set; }

        [Column("diet_id")]
        public int? DietId { get; set; }

        [Column("workout_id")]
        public int? WorkoutId { get; set; }
        [Column("ranks_id")]
        public int? RanksID { get; set; }
    }
}
