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
    [Produces("text/plain")] 
    public IActionResult GetPublicKey()
    {
        try 
        {
            return Content(JwtService.GetPublicKeyPem());
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error generating public key: {ex.Message}");
        }
    }
    
    [HttpGet("health")]
    public IActionResult HealthCheck()
    {
        return Ok("Service is healthy");
    }
}
public class LoginRequest
{
    public string Username { get; set; }
    public string Password { get; set; }
}
