using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace user_management_service.models {
    public class PasswordResetToken
    {
        [Key]
        public Guid Id { get; set; }
    
        [Required]
        public Guid UserId { get; set; }
    
        [Required]
        public string Token { get; set; } 
    
        [Required]
        public DateTime ExpiresAt { get; set; } 
    
        public bool Used { get; set; } = false;
    
        [ForeignKey("UserId")]
        public User User { get; set; }
    }
}

