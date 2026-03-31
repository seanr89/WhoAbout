using System;
using System.Threading.Tasks;

namespace bookings_api.Services;

public interface IDbInitializationSetup
{
    Task InitializeDatabaseAsync();
}
