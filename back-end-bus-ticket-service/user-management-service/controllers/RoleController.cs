using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

using user_management_service.services;
using user_management_service.dtos;

namespace user_management_service.controllers
{
    [Route("roles")]
    [ApiController]
    [Authorize]
    public class RolesController : ControllerBase
    {
        private readonly RoleService _roleService;

        public RolesController(RoleService roleService)
        {
            _roleService = roleService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetRoles()
        {
            return await _roleService.GetAllRolesAsync();
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateRole([FromBody] CreateRoleRequest request)
        {
            return await _roleService.CreateRoleAsync(request);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateRole(Guid id, [FromBody] UpdateRoleRequest request)
        {
            return await _roleService.UpdateRoleAsync(id, request);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteRole(Guid id)
        {
            return await _roleService.DeleteRoleAsync(id);
        }

        [HttpPost("assign/{userId}/{roleId}")]
        [Authorize(Roles = "Admin,Manager")] 
        public async Task<IActionResult> AssignRoleToUser(Guid userId, Guid roleId)
        {
            return await _roleService.AssignRoleToUserAsync(userId, roleId);
        }

        [HttpDelete("remove/{userId}/{roleId}")]
        [Authorize(Roles = "Admin,Manager")] 
        public async Task<IActionResult> RemoveRoleFromUser(Guid userId, Guid roleId)
        {
            return await _roleService.RemoveRoleFromUserAsync(userId, roleId);
        }
    }
}
