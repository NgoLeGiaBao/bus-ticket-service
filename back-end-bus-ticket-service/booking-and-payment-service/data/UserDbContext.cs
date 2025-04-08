using Microsoft.EntityFrameworkCore;
using booking_and_payment_service.models;   

namespace booking_and_payment_service.data
{
    public class UserDbContext : DbContext
    {
        public UserDbContext(DbContextOptions<UserDbContext> options) : base(options) {}

        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Payment> Payments { get; set; }
    }
}