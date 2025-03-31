using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace user_management_service.models{
    public class RefreshToken
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public Guid UserId { get; set; }
        [Required]
        public string Token { get; set; }
        [Required]
        public DateTime ExpiresAt { get; set; }
        public bool Revoked { get; set; } = false;
        [ForeignKey("UserId")]
        [JsonIgnore] 
        public User User { get; set; }
    }
}
