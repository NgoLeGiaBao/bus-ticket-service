using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using user_management_service.data;
using user_management_service.models;
using user_management_service.responses;
using user_management_service.dtos;

namespace user_management_service.services
{
    public class RoleService
    {
        private readonly UserDbContext _context;

        public RoleService(UserDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> GetAllRolesAsync()
        {
            var roles = await _context.Roles.ToListAsync();
            return new OkObjectResult(new ApiResponse<List<Role>>(true, "Roles retrieved successfully", roles, null));
        }

        public async Task<IActionResult> CreateRoleAsync(CreateRoleRequest request)
        {
            var role = new Role { Name = request.Name };

            _context.Roles.Add(role);
            await _context.SaveChangesAsync();

            return new CreatedAtActionResult("GetRoles", "Roles", new { id = role.Id }, 
                new ApiResponse<Role>(true, "Role created successfully", role, null));
        }

        public async Task<IActionResult> UpdateRoleAsync(Guid roleId, UpdateRoleRequest request)
        {
            var role = await _context.Roles.FindAsync(roleId);
            if (role == null)
            {
                return new NotFoundObjectResult(new ApiResponse<object>(false, "Role not found", null, "Role does not exist"));
            }

            role.Name = request.Name;
            await _context.SaveChangesAsync();

            return new OkObjectResult(new ApiResponse<Role>(true, "Role updated successfully", role, null));
        }

        public async Task<IActionResult> DeleteRoleAsync(Guid roleId)
        {
            var role = await _context.Roles.FindAsync(roleId);
            if (role == null)
            {
                return new NotFoundObjectResult(new ApiResponse<object>(false, "Role not found", null, "Role does not exist"));
            }

            _context.Roles.Remove(role);
            await _context.SaveChangesAsync();

            return new OkObjectResult(new ApiResponse<object>(true, "Role deleted successfully", null, null));
        }

        public async Task<IActionResult> AssignRoleToUserAsync(Guid userId, Guid roleId)
        {
            var user = await _context.Users.FindAsync(userId);
            var role = await _context.Roles.FindAsync(roleId);

            if (user == null || role == null)
            {
                return new BadRequestObjectResult(new ApiResponse<object>(false, "User or Role not found", null, "Invalid user or role ID"));
            }

            var userRole = new UserRole { UserId = userId, RoleId = roleId };

            _context.UserRoles.Add(userRole);
            await _context.SaveChangesAsync();

            return new OkObjectResult(new ApiResponse<object>(true, "Role assigned to user successfully", null, null));
        }

        public async Task<IActionResult> RemoveRoleFromUserAsync(Guid userId, Guid roleId)
        {
            var userRole = await _context.UserRoles
                .FirstOrDefaultAsync(ur => ur.UserId == userId && ur.RoleId == roleId);

            if (userRole == null)
            {
                return new BadRequestObjectResult(new ApiResponse<object>(false, "Role not assigned to user", null, "Invalid assignment"));
            }

            _context.UserRoles.Remove(userRole);
            await _context.SaveChangesAsync();

            return new OkObjectResult(new ApiResponse<object>(true, "Role removed from user successfully", null, null));
        }
    }
}
