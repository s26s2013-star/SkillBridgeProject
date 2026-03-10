using System.ComponentModel.DataAnnotations;

namespace SkillMatch.Api.Models
{
    public class SkillAssessment
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public int SkillId { get; set; }
        public Skill Skill { get; set; } = null!;

        public decimal Score { get; set; }

        public DateTime AssessmentDate { get; set; } = DateTime.UtcNow;

        [MaxLength(500)]
        public string? Notes { get; set; }
    }
}
