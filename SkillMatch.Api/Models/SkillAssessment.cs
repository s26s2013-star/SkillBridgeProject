using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SkillMatch.Api.Models
{
    public class SkillAssessment
    {
        [BsonId]
        public ObjectId Id { get; set; }

        public ObjectId UserId { get; set; }
        public ObjectId SkillId { get; set; }

        public decimal Score { get; set; }

        public DateTime AssessmentDate { get; set; } = DateTime.UtcNow;

        [MaxLength(500)]
        public string? Notes { get; set; }
    }
}
