using Microsoft.EntityFrameworkCore;
using SkillMatch.Api.Models;

namespace SkillMatch.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Skill> Skills { get; set; }
        public DbSet<Job> Jobs { get; set; }
        public DbSet<SkillAssessment> SkillAssessments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configuration
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Skill configuration
            modelBuilder.Entity<Skill>()
                .HasIndex(s => s.Name)
                .IsUnique();

            // SkillAssessment configuration
            modelBuilder.Entity<SkillAssessment>()
                .HasOne(sa => sa.User)
                .WithMany(u => u.SkillAssessments)
                .HasForeignKey(sa => sa.UserId);

            modelBuilder.Entity<SkillAssessment>()
                .HasOne(sa => sa.Skill)
                .WithMany(s => s.SkillAssessments)
                .HasForeignKey(sa => sa.SkillId);
        }
    }
}
