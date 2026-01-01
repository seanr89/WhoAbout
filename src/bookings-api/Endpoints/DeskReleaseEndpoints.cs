using bookings_api.Services;
using Microsoft.AspNetCore.Mvc;

namespace bookings_api.Endpoints;

public static class DeskReleaseEndpoints
{
    public static void MapDeskReleaseEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/desks").WithTags("Desk Releases");

        group.MapGet("/{deskId}/releases", async (int deskId, DeskReleaseService service) =>
        {
            return Results.Ok(await service.GetReleasesByDeskIdAsync(deskId));
        })
        .RequireAuthorization()
        .WithName("GetDeskReleases")
        .WithSummary("Get desk releases")
        .WithDescription("Retrieves a list of all date releases for a specific desk.");

        group.MapPost("/{deskId}/releases", async (int deskId, [FromBody] DateTime date, DeskReleaseService service) =>
        {
             var release = await service.CreateReleaseAsync(deskId, date);
             return Results.Created($"/api/desks/{deskId}/releases/{release.Id}", release);
        })
        .RequireAuthorization()
        .WithName("CreateDeskRelease")
        .WithSummary("Create desk release")
        .WithDescription("Creates a new release for a desk on a specific date.");

        group.MapDelete("/{deskId}/releases/{date}", async (int deskId, DateTime date, DeskReleaseService service) =>
        {
            var result = await service.DeleteReleaseAsync(deskId, date);
            if (!result) return Results.NotFound();
            return Results.NoContent();
        })
        .RequireAuthorization()
        .WithName("DeleteDeskRelease")
        .WithSummary("Delete desk release")
        .WithDescription("Deletes a desk release for a specific date.");
    }
}
