using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        if (request.Username == "admin" && request.Password == "password")
        {
            var token = JwtService.GenerateToken(request.Username, "admin");
            return Ok(new { token });
        }
        return Unauthorized();
    }

    [HttpGet("public-key")]
    public IActionResult GetPublicKey()
    {
        return Ok(new { publicKey = JwtService.GetPublicKeyPem() });
    }
}

public class LoginRequest
{
    public string Username { get; set; }
    public string Password { get; set; }
}
