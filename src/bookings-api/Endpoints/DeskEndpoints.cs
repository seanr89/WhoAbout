using bookings_api.Models;
using bookings_api.Services;
using Microsoft.AspNetCore.Mvc;

namespace bookings_api.Endpoints;

public static class DeskEndpoints
{
    public static void MapDeskEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/desks")
            .WithTags("Desks")
            .WithOpenApi();

        group.MapGet("/", async (DeskService service) =>
        {
            return Results.Ok(await service.GetAllDesksAsync());
        })
        .WithName("GetAllDesks");

        group.MapGet("/{id}", async (Guid id, DeskService service) =>
        {
            var desk = await service.GetDeskByIdAsync(id);
            return desk is not null ? Results.Ok(desk) : Results.NotFound();
        })
        .WithName("GetDeskById");

        group.MapPost("/", async ([FromBody] Desk desk, DeskService service) =>
        {
            var createdDesk = await service.CreateDeskAsync(desk);
            return Results.Created($"/api/desks/{createdDesk.Id}", createdDesk);
        })
        .WithName("CreateDesk");

        group.MapPut("/{id}", async (Guid id, [FromBody] Desk desk, DeskService service) =>
        {
            var updatedDesk = await service.UpdateDeskAsync(id, desk);
            return updatedDesk is not null ? Results.Ok(updatedDesk) : Results.NotFound();
        })
        .WithName("UpdateDesk");

        group.MapDelete("/{id}", async (Guid id, DeskService service) =>
        {
            var deleted = await service.DeleteDeskAsync(id);
            return deleted ? Results.NoContent() : Results.NotFound();
        })
        .WithName("DeleteDesk");
    }
}
