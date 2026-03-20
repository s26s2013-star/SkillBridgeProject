using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SkillMatch.Api.Models
{
    public class UserSkillVerification
    {
        [BsonId]
        public ObjectId Id { get; set; }

        public ObjectId UserId { get; set; }

        public string SkillName { get; set; } = string.Empty;

        public int QuestionIndex { get; set; }

        public bool Answer { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
