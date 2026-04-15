using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace bookings_api.Endpoints;

public static class HealthCheckEndpoints
{
    /// <summary>
    /// Maps health check endpoints.
    /// </summary>
    /// <param name="app">The endpoint route builder.</param>
    public static void MapHealthCheckEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/health")
            .WithTags("Health")
            .WithOpenApi();

        // group.MapHealthChecks("/")
        //     .WithName("GetHealth")
        //     .WithSummary("Get service health")
        //     .WithDescription("Provides an endpoint to check the overall health of the application.");

        // Simple health check ping
        app.MapGet("/healthcheck", () => Results.Ok("Healthy"))
            .WithTags("Health")
            .WithName("GetHealthCheck")
            .WithSummary("Simple health check")
            .WithDescription("A lightweight endpoint that returns a simple 'Healthy' status.");

        // Database health check
        app.MapGet("/dbhealth", async (bookings_api.Data.AppDbContext context) =>
        {
            try
            {
                var canConnect = await context.Database.CanConnectAsync();
                if (canConnect)
                {
                    return Results.Ok(new { status = "Healthy", message = "Database connection successful" });
                }
                return Results.Problem("Cannot connect to the database", statusCode: 503);
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message, statusCode: 503);
            }
        })
        .WithTags("Health")
        .WithName("GetDbHealth")
        .WithSummary("Check database health")
        .WithDescription("Verifies if the application can successfully connect to the database.");
    }
}
