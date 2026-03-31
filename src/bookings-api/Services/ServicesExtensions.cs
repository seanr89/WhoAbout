using Microsoft.Extensions.DependencyInjection;
namespace bookings_api.Services;

public static class ServicesExtensions
{
    public static IServiceCollection AddApiServices(this IServiceCollection services)
    {
        services.AddScoped<OfficeService>();
        services.AddScoped<DeskService>();
        services.AddScoped<BookingService>();
        services.AddScoped<StaffMemberService>();
        services.AddScoped<DeskReleaseService>();
        services.AddScoped<IDbInitializationSetup, DbInitializationSetup>();
        
        return services;
    }
}
