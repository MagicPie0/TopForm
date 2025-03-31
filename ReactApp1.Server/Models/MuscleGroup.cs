using System.ComponentModel.DataAnnotations.Schema;

namespace asp.Server.Models
{
    [Table("muscle_groups")]
    public class MuscleGroup
    {
        public int id { get; set; } // Primary key (nem változik)
        public required string name1 { get; set; }
        public required int kg1 { get; set; }
        public required string name2 { get; set; }
        public required int kg2 { get; set; }
        public required string name3 { get; set; }
        public required int kg3 { get; set; }
        public required string name4 { get; set; }
        public required int kg4 { get; set; }

        public DateTime? date { get; set; }
    }


}
