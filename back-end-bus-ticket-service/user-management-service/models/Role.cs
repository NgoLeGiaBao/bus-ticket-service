using System.ComponentModel.DataAnnotations;

namespace user_management_service.models
{
    public class Role
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public string Name { get; set; } 
        public ICollection<User> Users { get; set; } = new List<User>();
    }
}