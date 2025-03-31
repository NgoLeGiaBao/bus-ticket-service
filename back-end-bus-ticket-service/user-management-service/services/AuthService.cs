using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;


using user_management_service.models;
using user_management_service.data;
using user_management_service.responses;
using user_management_service.dtos;

namespace user_management_service.services {
    public class AuthService
    {
        private readonly UserDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(UserDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<ApiResponse<User>> Register(RegisterRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.PhoneNumber == request.PhoneNumber))
                return new ApiResponse<User>(false, "Email or Phone already exists", null, "Duplicate phone");

            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = request.Username,
                Email = "",
                PhoneNumber = request.PhoneNumber,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return new ApiResponse<User>(true, "User registered successfully", user, null);
        }

        public async Task<ApiResponse<AuthResponse>> Login(LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.PhoneNumber || u.PhoneNumber == request.PhoneNumber);
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return new ApiResponse<AuthResponse>(false, "Invalid email or password", null, "Unauthorized");

            var token = GenerateJwtToken(user);
            var refreshToken = GenerateRefreshToken(user.Id);

            return new ApiResponse<AuthResponse>(true, "Login successful", new AuthResponse {User = user, AccessToken = token, RefreshToken = refreshToken }, null);
        }

        public async Task<ApiResponse<AuthResponse>> RefreshToken(RefreshTokenRequest request)
        {
            var refreshToken = await _context.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.Token == request.Token && !rt.Revoked);

            if (refreshToken == null || refreshToken.ExpiresAt < DateTime.UtcNow.AddHours(7))
                return new ApiResponse<AuthResponse>(false, "Invalid or expired refresh token", null, "Unauthorized");

            var user = await _context.Users.FindAsync(refreshToken.UserId);
            var newAccessToken = GenerateJwtToken(user);
            var newRefreshToken = GenerateRefreshToken(user.Id);

            refreshToken.Revoked = true;
            await _context.SaveChangesAsync();

            return new ApiResponse<AuthResponse>(true, "Token refreshed successfully", new AuthResponse { AccessToken = newAccessToken, RefreshToken = newRefreshToken }, null);
        }

        private string GenerateJwtToken(User user)
        {
            var key = Encoding.UTF8.GetBytes(_configuration["JwtSettings:Secret"]);
            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                    new Claim(JwtRegisteredClaimNames.Email, user.Email),
                    new Claim("phone", user.PhoneNumber),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()) 
                }),
                Issuer = _configuration["JwtSettings:Issuer"], 
                Audience = _configuration["JwtSettings:Audience"], 
                Expires = DateTime.UtcNow.AddHours(7).AddMinutes(Convert.ToInt32(_configuration["JwtSettings:AccessTokenExpiryMinutes"])),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256)
            };
            return tokenHandler.WriteToken(tokenHandler.CreateToken(tokenDescriptor));
        }

        private string GenerateRefreshToken(Guid userId)
        {
            var refreshToken = new RefreshToken
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Token = Convert.ToBase64String(Guid.NewGuid().ToByteArray()),
                ExpiresAt = DateTime.UtcNow.AddHours(7).AddDays(Convert.ToInt32(_configuration["JwtSettings:RefreshTokenExpiryDays"]))
            };

            _context.RefreshTokens.Add(refreshToken);
            _context.SaveChanges();

            return refreshToken.Token;
        }
    
    }
}
