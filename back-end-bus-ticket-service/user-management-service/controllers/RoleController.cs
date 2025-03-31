using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

using user_management_service.services;
using user_management_service.dtos;

namespace user_management_service.controllers
{
    [Route("api/roles")]
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
        public async Task<IActionResult> GetRoles()
        {
            return await _roleService.GetAllRolesAsync();
        }

        [HttpPost]
        public async Task<IActionResult> CreateRole([FromBody] CreateRoleRequest request)
        {
            return await _roleService.CreateRoleAsync(request);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRole(Guid id, [FromBody] UpdateRoleRequest request)
        {
            return await _roleService.UpdateRoleAsync(id, request);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRole(Guid id)
        {
            return await _roleService.DeleteRoleAsync(id);
        }

        [HttpPost("assign/{userId}/{roleId}")]
        public async Task<IActionResult> AssignRoleToUser(Guid userId, Guid roleId)
        {
            return await _roleService.AssignRoleToUserAsync(userId, roleId);
        }

        [HttpDelete("remove/{userId}/{roleId}")]
        public async Task<IActionResult> RemoveRoleFromUser(Guid userId, Guid roleId)
        {
            return await _roleService.RemoveRoleFromUserAsync(userId, roleId);
        }
    }
}
