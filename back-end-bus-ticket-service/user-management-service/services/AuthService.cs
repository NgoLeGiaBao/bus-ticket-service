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
                Email = request.Email== null ? null : request.Email,
                PhoneNumber = request.PhoneNumber,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Find or create the 'customer' role
            var customerRole = await _context.Roles
                .FirstOrDefaultAsync(r => r.Name == "Customer");

            // If the role doesn't exist, create it
            if (customerRole == null)
            {
                customerRole = new Role
                {
                    Id = Guid.NewGuid(),
                    Name = "Customer"
                };
                _context.Roles.Add(customerRole);
                await _context.SaveChangesAsync();
            }

            // Assign the user to the 'customer' role
            var userRole = new UserRole
            {
                UserId = user.Id,
                RoleId = customerRole.Id
            };

            _context.UserRoles.Add(userRole);
            await _context.SaveChangesAsync();

            return new ApiResponse<User>(true, "User registered successfully", user, null);
        }

        public async Task<ApiResponse<AuthResponse>> Login(LoginRequest request)
        {
            var user = await _context.Users
                .Where(u => u.PhoneNumber == request.PhoneNumber && u.IsActive == true)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .AsNoTracking()
                .FirstOrDefaultAsync();

            if (user == null) 
                return new ApiResponse<AuthResponse>(false, "Phone number not found or inactive", null, "Unauthorized");

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return new ApiResponse<AuthResponse>(false, "Invalid password", null, "Unauthorized");

            // Get user roles
            var roleNames = user.UserRoles
                .Select(ur => ur.Role.Name)
                .ToList();

            var token = GenerateJwtToken(user, roleNames);
            var refreshToken = GenerateRefreshToken(user.Id);

            return new ApiResponse<AuthResponse>(true, "Login successful", new AuthResponse
            {
                User = user,
                AccessToken = token,
                RefreshToken = refreshToken,
                Roles = roleNames
            }, null);
        }

        public async Task<ApiResponse<string>> LogoutAsync(Guid userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return new ApiResponse<string>(false, "User not found.", null, "UserNotFound");
            
            var refreshToken = await _context.RefreshTokens.FirstOrDefaultAsync(rt => rt.UserId == userId);
            if (refreshToken != null)
            {
                _context.RefreshTokens.Remove(refreshToken);
                await _context.SaveChangesAsync();
            }
            return new ApiResponse<string>(true, "Logout successful.", null, null);
        }

        public async Task<ApiResponse<AuthResponse>> RefreshToken(RefreshTokenRequest request)
        {
            var refreshToken = await _context.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.Token == request.Token && !rt.Revoked);

            if (refreshToken == null || refreshToken.ExpiresAt < DateTime.UtcNow)
                return new ApiResponse<AuthResponse>(false, "Invalid or expired refresh token", null, "Unauthorized");

            var user = await _context.Users
                .Include(u => u.UserRoles)  
                    .ThenInclude(ur => ur.Role)  
                .FirstOrDefaultAsync(u => u.Id == refreshToken.UserId);

            var roleNames = user?.UserRoles.Select(ur => ur.Role.Name).ToList();

            var newAccessToken = GenerateJwtToken(user, roleNames);
            var newRefreshToken = GenerateRefreshToken(user.Id);

            refreshToken.Revoked = true;
            await _context.SaveChangesAsync();

            return new ApiResponse<AuthResponse>(true, "Token refreshed successfully", new AuthResponse { AccessToken = newAccessToken, RefreshToken = newRefreshToken }, null);
        }

        private string GenerateJwtToken(User user, List<string> roles = null)
        {
            var key = Encoding.UTF8.GetBytes(_configuration["JwtSettings:Secret"]);
            var tokenHandler = new JwtSecurityTokenHandler();

            // Create claims from user
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Name, user.Username),
                new Claim("phone", user.PhoneNumber),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            
            if (roles != null && roles.Any())
            {
                claims.AddRange(roles.Select(role => new Claim("role", role)));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),  
                Issuer = _configuration["JwtSettings:Issuer"], 
                Audience = _configuration["JwtSettings:Audience"], 
                Expires = DateTime.UtcNow.AddMinutes(Convert.ToInt32(_configuration["JwtSettings:AccessTokenExpiryMinutes"])),
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
                ExpiresAt = DateTime.UtcNow.AddDays(Convert.ToInt32(_configuration["JwtSettings:RefreshTokenExpiryDays"]))
            };

            _context.RefreshTokens.Add(refreshToken);
            _context.SaveChanges();

            return refreshToken.Token;
        }
    
    }
}
