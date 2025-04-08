using StackExchange.Redis;
using System.Text;

namespace booking_and_payment_service.services
{
    public class RedisService
    {
        private readonly IDatabase _db;
    
        public RedisService(IConnectionMultiplexer redis)
        {
            _db = redis.GetDatabase();
        }
    
        public async Task SetKeyAsync(string key, string value, TimeSpan? expiry = null)
        {
            await _db.StringSetAsync(key, value, expiry);
        }
    
        public async Task<string?> GetKeyAsync(string key)
        {
            return await _db.StringGetAsync(key);
        }
    
        public async Task<bool> KeyExistsAsync(string key)
        {
            return await _db.KeyExistsAsync(key);
        }
    
        public async Task DeleteKeyAsync(string key)
        {
            await _db.KeyDeleteAsync(key);
        }
    }

}