using Microsoft.EntityFrameworkCore;

namespace route_and_trip_management_service.Models.Entity
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options){}

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Route>()
                .HasMany(r => r.Trips)
                .WithOne(t => t.Route)
                .HasForeignKey(t => t.RouteID);

            modelBuilder.Entity<Route>()
                .Property(r => r.RouteID)
                .HasDefaultValueSql("NEWID()"); 

            modelBuilder.Entity<Trip>()
                .Property(t => t.TripID)
                .HasDefaultValueSql("NEWID()");
        }

        public DbSet<Route> Routes { get; set; }
        public DbSet<Trip> Trips { get; set; }

    }
}
