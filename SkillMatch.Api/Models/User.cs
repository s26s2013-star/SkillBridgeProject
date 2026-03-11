using System.ComponentModel.DataAnnotations;

namespace SkillMatch.Api.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Role { get; set; } = string.Empty; // Student, Employer, Admin

        // Navigation properties
        public ICollection<SkillAssessment> SkillAssessments { get; set; } = new List<SkillAssessment>();
    }
}
