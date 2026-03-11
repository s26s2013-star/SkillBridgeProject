using System.ComponentModel.DataAnnotations;

namespace SkillMatch.Api.Models
{
    public class Skill
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Category { get; set; } = string.Empty;

        // Navigation properties
        public ICollection<SkillAssessment> SkillAssessments { get; set; } = new List<SkillAssessment>();
    }
}
