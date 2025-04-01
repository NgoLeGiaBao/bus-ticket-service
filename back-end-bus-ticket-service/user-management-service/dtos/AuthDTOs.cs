using user_management_service.models;

namespace user_management_service.dtos {
    public class RegisterRequest
    {
        public string PhoneNumber { get; set; }
        public string Password { get; set; }
        public string Username { get; set; }
    }
    
    public class LoginRequest
    {
        public string PhoneNumber { get; set; }
        public string Password { get; set; }
    }
    
    public class RefreshTokenRequest
    {
        public string Token { get; set; }
    }
    
    public class AuthResponse
    {
        public User User { get; set; }
        public List<string> Roles { get; set; }
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
    }

}