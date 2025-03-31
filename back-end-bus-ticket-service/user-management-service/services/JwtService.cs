// JwtService.cs
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.IdentityModel.Tokens;

public static class JwtService
{
    private static readonly RSA _rsaKey = RSA.Create(2048);
    private static readonly RsaSecurityKey _privateKey = new RsaSecurityKey(_rsaKey);

    public static string GenerateToken(string username, string role)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim("unique_name", username),
                new Claim("role", role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat, 
                         DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), 
                         ClaimValueTypes.Integer64),
                new Claim(JwtRegisteredClaimNames.Nbf, 
                         DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(),
                         ClaimValueTypes.Integer64),
                new Claim(JwtRegisteredClaimNames.Exp,
                         DateTimeOffset.UtcNow.AddHours(1).ToUnixTimeSeconds().ToString(),
                         ClaimValueTypes.Integer64)
            }),
            SigningCredentials = new SigningCredentials(
                _privateKey,
                SecurityAlgorithms.RsaSha256)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public static string GetPublicKeyPem()
    {
        var publicKeyBytes = _rsaKey.ExportSubjectPublicKeyInfo();
        return "-----BEGIN PUBLIC KEY-----\n" + 
               Convert.ToBase64String(publicKeyBytes, Base64FormattingOptions.InsertLineBreaks) + 
               "\n-----END PUBLIC KEY-----";
    }
}
