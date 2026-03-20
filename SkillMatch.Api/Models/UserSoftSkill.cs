using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SkillMatch.Api.Models
{
    public class UserSoftSkill
    {
        [BsonId]
        public ObjectId Id { get; set; }

        public ObjectId UserId { get; set; }

        public double CommunicationScore { get; set; }
        public double TeamworkScore { get; set; }
        public double ProblemSolvingScore { get; set; }
        public double AdaptabilityScore { get; set; }
        public double TimeManagementScore { get; set; }

        // e.g. { "communication": "advanced", "teamwork": "intermediate" }
        public Dictionary<string, string> ProficiencyLevels { get; set; } = new();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
