using Microsoft.EntityFrameworkCore;

namespace route_and_trip_management_service.Models
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {

        }
    }
}
