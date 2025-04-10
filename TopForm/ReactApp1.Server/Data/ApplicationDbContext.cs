using Microsoft.EntityFrameworkCore;
using back_end.Models;
using asp.Server.Controllers;
using asp.Server.Models;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace back_end.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public virtual DbSet<User> Users { get; set; }
        public virtual DbSet<MuscleGroup> MuscleGroups { get; set; } 
        public virtual DbSet<user_activity> UserActivity { get; set; }
        public virtual DbSet<Workouts> Workouts { get; set; }
        public virtual DbSet<Diet> Diet { get; set; }
        public virtual DbSet<Ranks> Ranks { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

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

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);

            optionsBuilder.ConfigureWarnings(warnings => warnings.Ignore(InMemoryEventId.TransactionIgnoredWarning));
        }

    }
}
