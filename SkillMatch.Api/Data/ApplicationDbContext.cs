using Microsoft.EntityFrameworkCore;
using MongoDB.EntityFrameworkCore;
using MongoDB.EntityFrameworkCore.Extensions;
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
        public DbSet<UserSoftSkill> UserSoftSkills { get; set; }
        public DbSet<SkillVerificationQuestion> SkillVerificationQuestions { get; set; }
        public DbSet<UserSkillVerification> UserSkillVerifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>().ToCollection("users");
            modelBuilder.Entity<Skill>().ToCollection("skills");
            modelBuilder.Entity<Job>().ToCollection("jobs");
            modelBuilder.Entity<SkillAssessment>().ToCollection("skill_assessments");
            modelBuilder.Entity<UserSoftSkill>().ToCollection("user_soft_skills");
            modelBuilder.Entity<SkillVerificationQuestion>().ToCollection("skill_verification_questions");
            modelBuilder.Entity<UserSkillVerification>().ToCollection("user_skill_verifications");
        }
    }
}
