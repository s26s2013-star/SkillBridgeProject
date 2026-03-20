using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SkillMatch.Api.Models
{
    public class SkillVerificationQuestion
    {
        [BsonId]
        public ObjectId Id { get; set; }

        public string SkillName { get; set; } = string.Empty;   // "python", "sql", "react", etc.

        public List<string> Questions { get; set; } = new();
    }
}
