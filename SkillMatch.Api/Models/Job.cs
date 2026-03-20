using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SkillMatch.Api.Models
{
    public class Job
    {
        [BsonId]
        public ObjectId Id { get; set; }

        public string Job_ID { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Job_Type { get; set; } = string.Empty;
        public string Experience_Required { get; set; } = string.Empty;
        public string Key_Skills { get; set; } = string.Empty;
        public string Soft_Skills { get; set; } = string.Empty;
        public string Qualifications { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Source_URL { get; set; } = string.Empty;
        public string Industry { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
