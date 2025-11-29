using bookings_api.Models;
using bookings_api.Services;
using Microsoft.AspNetCore.Mvc;

namespace bookings_api.Endpoints;

public static class OfficeEndpoints
{
    public static void MapOfficeEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/offices")
            .WithTags("Offices")
            .WithOpenApi();

        group.MapGet("/", async (OfficeService service) =>
        {
            return Results.Ok(await service.GetAllOfficesAsync());
        })
        .WithName("GetAllOffices");

        group.MapGet("/{id}", async (Guid id, OfficeService service) =>
        {
            var office = await service.GetOfficeByIdAsync(id);
            return office is not null ? Results.Ok(office) : Results.NotFound();
        })
        .WithName("GetOfficeById");

        group.MapPost("/", async ([FromBody] Office office, OfficeService service) =>
        {
            var createdOffice = await service.CreateOfficeAsync(office);
            return Results.Created($"/api/offices/{createdOffice.Id}", createdOffice);
        })
        .WithName("CreateOffice");

        group.MapPut("/{id}", async (Guid id, [FromBody] Office office, OfficeService service) =>
        {
            var updatedOffice = await service.UpdateOfficeAsync(id, office);
            return updatedOffice is not null ? Results.Ok(updatedOffice) : Results.NotFound();
        })
        .WithName("UpdateOffice");

        group.MapDelete("/{id}", async (Guid id, OfficeService service) =>
        {
            var deleted = await service.DeleteOfficeAsync(id);
            return deleted ? Results.NoContent() : Results.NotFound();
        })
        .WithName("DeleteOffice");
    }
}
