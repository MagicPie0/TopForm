using Microsoft.EntityFrameworkCore;
using back_end.Models;
using asp.Server.Controllers;
using asp.Server.Models;

namespace back_end.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<MuscleGroup> MuscleGroups { get; set; } // Izomcsoportok tábla
        public DbSet<user_activity> UserActivity { get; set; }
        public DbSet<Workouts> Workouts { get; set; }
        public DbSet<Diet> Diet { get; set; }
        public DbSet<Ranks> Ranks { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Explicit leképezés a user_id és muscle_group_id oszlopokhoz
            modelBuilder.Entity<user_activity>()
                .Property(u => u.UserId)
                .HasColumnName("user_id");

            modelBuilder.Entity<user_activity>()
                .Property(m => m.MuscleGroupId)
                .HasColumnName("muscle_group_id");

            modelBuilder.Entity<user_activity>()
                .Property(w => w.WorkoutId)
                .HasColumnName("workout_id");

            modelBuilder.Entity<user_activity>()
                .Property(d => d.DietId)
                .HasColumnName("diet_id");

            modelBuilder.Entity<user_activity>()
                .Property(r => r.RanksID)
                .HasColumnName("ranks_id");

        }

    }
}
