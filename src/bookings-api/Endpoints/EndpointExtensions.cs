using Microsoft.AspNetCore.Routing;
namespace bookings_api.Endpoints;

public static class EndpointExtensions
{
    /// <summary>
    /// Maps all API endpoints to the endpoint route builder.
    /// </summary>
    /// <param name="app">The endpoint route builder.</param>
    public static void MapApiEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapOfficeEndpoints();
        app.MapDeskEndpoints();
        app.MapBookingEndpoints();
        app.MapStaffMemberEndpoints();
        app.MapDeskReleaseEndpoints();
        app.MapHealthCheckEndpoints();
    }
}
