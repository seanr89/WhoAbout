using Microsoft.AspNetCore.Routing;
namespace bookings_api.Endpoints;

public static class EndpointExtensions
{
    public static void MapApiEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapOfficeEndpoints();
        app.MapDeskEndpoints();
        app.MapBookingEndpoints();
        app.MapStaffMemberEndpoints();
        app.MapDeskReleaseEndpoints();
    }
}
