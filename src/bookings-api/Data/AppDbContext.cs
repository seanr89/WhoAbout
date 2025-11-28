using Microsoft.EntityFrameworkCore;

namespace bookings_api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // public DbSet<YourEntity> YourEntities { get; set; }
}
