using System.Security.Cryptography;
using System.Text;

public class VNPayUtil
{
    public string HmacSHA512(string key, string data)
    {
        using var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(key));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        return BitConverter.ToString(hash).Replace("-", "").ToLower();
    }

    public string HashAllFields(Dictionary<string, string> fields, string secretKey)
    {
        var sortedKeys = fields.Keys.OrderBy(x => x).ToList();
        var rawData = string.Join("&", sortedKeys.Select(k => $"{k}={fields[k]}"));
        return HmacSHA512(secretKey, rawData);
    }

    public string GetRandomNumber(int length)
    {
        var rng = new Random();
        const string chars = "0123456789";
        return new string(Enumerable.Repeat(chars, length).Select(s => s[rng.Next(s.Length)]).ToArray());
    }
}
