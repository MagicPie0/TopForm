using System.ComponentModel.DataAnnotations.Schema;

namespace asp.Server.Models
{
    public class Diet
    {
        public int Id { get; set; }

        [Column("breakfast")]
        public string? Breakfast { get; set; }

        [Column("lunch")]
        public string? Lunch { get; set; }

        [Column("diner")]
        public string? Diner { get; set; }

        [Column("dessert")]
        public string? Dessert { get; set; }

        [Column("food_date")]
        public DateTime FoodDate { get; set; }
    }
}
