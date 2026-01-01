using bookings_api.Models;
using bookings_api.Models.DTOs;
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
            var desks = await service.GetAllDesksAsync();
            var dtos = desks.Select(d => new DeskDto
            {
                Id = d.Id,
                Name = d.Name,
                Type = d.Type,
                OfficeId = d.OfficeId,
                ReservedForStaffMemberId = d.ReservedForStaffMemberId
            });
            return Results.Ok(dtos);
        })
        .RequireAuthorization()
        .WithName("GetAllDesks")
        .WithSummary("Get all desks")
        .WithDescription("Retrieves a list of all desks across all offices.");

        group.MapGet("/{id}", async (int id, DeskService service) =>
        {
            var desk = await service.GetDeskByIdAsync(id);
            return desk is not null ? Results.Ok(desk) : Results.NotFound();
        })
        .RequireAuthorization()
        .WithName("GetDeskById")
        .WithSummary("Get desk by ID")
        .WithDescription("Retrieves a specific desk by its unique ID.");

        group.MapPost("/", async ([FromBody] Desk desk, DeskService service) =>
        {
            var createdDesk = await service.CreateDeskAsync(desk);
            return Results.Created($"/api/desks/{createdDesk.Id}", createdDesk);
        })
        .RequireAuthorization()
        .WithName("CreateDesk")
        .WithSummary("Create desk")
        .WithDescription("Creates a new desk record.");

        group.MapPut("/{id}", async (int id, [FromBody] Desk desk, DeskService service) =>
        {
            var updatedDesk = await service.UpdateDeskAsync(id, desk);
            return updatedDesk is not null ? Results.Ok(updatedDesk) : Results.NotFound();
        })
        .RequireAuthorization()
        .WithName("UpdateDesk")
        .WithSummary("Update desk")
        .WithDescription("Updates an existing desk's details.");

        group.MapDelete("/{id}", async (int id, DeskService service) =>
        {
            var deleted = await service.DeleteDeskAsync(id);
            return deleted ? Results.NoContent() : Results.NotFound();
        })
        .RequireAuthorization()
        .WithName("DeleteDesk")
        .WithSummary("Delete desk")
        .WithDescription("Deletes a desk by its unique ID.");
    }
}
