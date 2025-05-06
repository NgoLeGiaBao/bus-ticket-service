using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

using user_management_service.data;
using user_management_service.dtos;
using user_management_service.models;
using user_management_service.responses;

namespace user_management_service.services
{
    public class UserService
    {
        private readonly UserDbContext _context;

        public UserService(UserDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<UserDTO>> GetUserById(Guid userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return new ApiResponse<UserDTO>(false, "User not found", null, "User not found");

            var userDto = new UserDTO
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber
            };

            return new ApiResponse<UserDTO>(true, "User retrieved successfully", userDto, null);
        }

        public async Task<ApiResponse<UserDTO>> UpdateUser(Guid userId, UpdateUserRequest request)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return new ApiResponse<UserDTO>(false, "User not found", null, "User not found");

            if (!string.IsNullOrEmpty(request.Username))
                user.Username = request.Username;

            if (!string.IsNullOrEmpty(request.Email))
            {
                var emailExists = await _context.Users.AnyAsync(u => u.Email == request.Email && u.Id != userId);
                if (emailExists)
                    return new ApiResponse<UserDTO>(false, "Email already in use", null, "Duplicate email");

                user.Email = request.Email;
            }

            var userDto = new UserDTO
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber
            };

            await _context.SaveChangesAsync();
            return new ApiResponse<UserDTO>(true, "User updated successfully", userDto, null);
        }

        public async Task<ApiResponse<string>> ChangePassword(Guid userId, ChangePasswordRequest request)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return new ApiResponse<string>(false, "User not found", null, "User not found");

            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
                return new ApiResponse<string>(false, "Incorrect current password", null, "Unauthorized");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();

            return new ApiResponse<string>(true, "Password changed successfully", null, null);
        }

        public async Task<ApiResponse<List<UserWithRolesDTO>>> GetAllUsersWithRoles()
        {
            var users = await _context.Users
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Select(u => new UserWithRolesDTO
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    PhoneNumber = u.PhoneNumber,
                    Roles = u.UserRoles.Select(ur => new RoleDTO
                    {
                        RoleId = ur.Role.Id,    
                        RoleName = ur.Role.Name  
                    }).ToList()
                })
                .ToListAsync();

            return new ApiResponse<List<UserWithRolesDTO>>(true, "Users retrieved successfully", users, null);
        }
    }
}