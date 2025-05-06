using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

using user_management_service.dtos;
using user_management_service.services;

namespace user_management_service.controllers{
    [Route("user")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly UserService _userService;

        public UserController(UserService userService)
        {
            _userService = userService;
        }

        private Guid GetUserId()
        {
            return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetUserProfile()
        {
            var response = await _userService.GetUserById(GetUserId());
            return response.Success ? Ok(response) : NotFound(response);
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateUserProfile([FromBody] UpdateUserRequest request)
        {
            var response = await _userService.UpdateUser(GetUserId(), request);
            return response.Success ? Ok(response) : BadRequest(response);
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var response = await _userService.ChangePassword(GetUserId(), request);
            return response.Success ? Ok(response) : Unauthorized(response);
        }
        [HttpGet("get-all-users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var response = await _userService.GetAllUsersWithRoles();
            return response.Success ? Ok(response) : BadRequest(response);
        }
    }
}