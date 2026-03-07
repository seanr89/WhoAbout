using bookings_api.Services;
using Microsoft.AspNetCore.Mvc;

namespace bookings_api.Endpoints;

public static class DeskReleaseEndpoints
{
    public static void MapDeskReleaseEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/deskreleases").WithTags("Desk Releases");

        /// <summary>
        /// Get desk releases
        /// </summary>
        /// <param name="deskId"></param>
        /// <param name="service"></param>
        /// <returns></returns>
        group.MapGet("/{deskId}/releases", async (int deskId, DeskReleaseService service) =>
        {
            return Results.Ok(await service.GetReleasesByDeskIdAsync(deskId));
        })
        .RequireAuthorization()
        .WithName("GetDeskReleases")
        .WithSummary("Get desk releases")
        .WithDescription("Retrieves a list of all date releases for a specific desk.");

        /// <summary>
        /// Create desk release
        /// </summary>
        /// <param name="deskId"></param>
        /// <param name="date"></param>
        /// <param name="service"></param>
        /// <returns></returns>
        group.MapPost("/{deskId}/releases", async (int deskId, [FromBody] DateTime date, DeskReleaseService service) =>
        {
             var release = await service.CreateReleaseAsync(deskId, date);
             return Results.Created($"/api/deskreleases/{deskId}/releases/{release.Id}", release);
        })
        .RequireAuthorization()
        .WithName("CreateDeskRelease")
        .WithSummary("Create desk release")
        .WithDescription("Creates a new release for a desk on a specific date.");

        /// <summary>
        /// Delete desk release
        /// </summary>
        /// <param name="deskId"></param>
        /// <param name="date"></param>
        /// <param name="service"></param>
        /// <returns></returns>
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

        /// <summary>
        /// Get releases by date and office
        /// </summary>
        /// <param name="date"></param>
        /// <param name="officeId"></param>
        /// <param name="service"></param>
        /// <returns></returns>
        group.MapGet("/releases", async ([FromQuery] DateTime date, [FromQuery] Guid officeId, DeskReleaseService service) =>
        {
             var releases = await service.GetReleasesByDateAndOfficeAsync(date, officeId);
             var deskIds = releases.Select(r => r.DeskId).ToList();
             return Results.Ok(deskIds);
        })
        .RequireAuthorization()
        .WithName("GetReleasesByDateAndOffice")
        .WithSummary("Get releases by date and office")
        .WithDescription("Retrieves a list of desk IDs that are released for a specific date and office.");
    }
}
