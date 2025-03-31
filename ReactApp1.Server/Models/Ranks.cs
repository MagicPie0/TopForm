using System.ComponentModel.DataAnnotations.Schema;

namespace asp.Server.Models
{
    [Table("ranks")]
    public class Ranks
    {
        public int id { get; set; }

        [Column("rank_name")]
        public required string rankName { get; set; }

        [Column("points")]
        public required int points { get; set; }

    }


}
