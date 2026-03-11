using System.ComponentModel.DataAnnotations;

namespace SkillMatch.Api.Models
{
    public class UserSkill
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string SkillName { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string SkillType { get; set; } = "Technical"; // Technical or Soft Skill

        [Required]
        [MaxLength(20)]
        public string Level { get; set; } = "Beginner"; // Beginner, Intermediate, Advanced

        public User User { get; set; } = null!;
    }
}