using bookings_api.Data;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace bookings_api.Services;

public class DbInitializationSetup(AppDbContext context, ILogger<DbInitializationSetup> logger) : IDbInitializationSetup
{
    private readonly AppDbContext _context = context;
    private readonly ILogger<DbInitializationSetup> _logger = logger;

    public Task InitializeDatabaseAsync()
    {
        try
        {
            DbInitializer.Initialize(_context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred creating the DB.");
        }

        return Task.CompletedTask;
    }
}
