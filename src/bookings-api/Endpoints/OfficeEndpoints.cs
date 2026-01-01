using bookings_api.Models;
using bookings_api.Models.DTOs;
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

        group.MapGet("/", async (OfficeService service, ILoggerFactory loggerFactory) =>
        {
            //var logger = loggerFactory.CreateLogger("OfficeEndpoints");
            //logger.LogInformation("Getting all offices");
            var offices = await service.GetAllOfficesAsync();
            var dtos = offices.Select(o => new OfficeDto
            {
                Id = o.Id,
                Name = o.Name,
                Location = o.Location,
                SeatMapUrl = o.SeatMapUrl
            });
            return Results.Ok(dtos);
        })
        .RequireAuthorization()
        .WithName("GetAllOffices")
        .WithSummary("Get all offices")
        .WithDescription("Retrieves a list of all office locations.");

        group.MapGet("/{id}", async (Guid id, OfficeService service, ILoggerFactory loggerFactory) =>
        {
            var logger = loggerFactory.CreateLogger("OfficeEndpoints");
            //logger.LogInformation("Getting office with Id: {Id}", id);
            var office = await service.GetOfficeByIdAsync(id);
            if (office is null)
            {
                logger.LogWarning("Office with Id: {Id} not found", id);
                return Results.NotFound();
            }
            return Results.Ok(office);
        })
        .RequireAuthorization()
        .WithName("GetOfficeById")
        .WithSummary("Get office by ID")
        .WithDescription("Retrieves a specific office location by its unique ID.");

        group.MapPost("/", async ([FromBody] Office office, OfficeService service, ILoggerFactory loggerFactory) =>
        {
            var logger = loggerFactory.CreateLogger("OfficeEndpoints");
            logger.LogInformation("Creating new office: {Name}", office.Name);
            var createdOffice = await service.CreateOfficeAsync(office);
            return Results.Created($"/api/offices/{createdOffice.Id}", createdOffice);
        })
        .RequireAuthorization()
        .WithName("CreateOffice")
        .WithSummary("Create office")
        .WithDescription("Creates a new office location.");

        group.MapPut("/{id}", async (Guid id, [FromBody] Office office, OfficeService service, ILoggerFactory loggerFactory) =>
        {
            var logger = loggerFactory.CreateLogger("OfficeEndpoints");
            logger.LogInformation("Updating office with Id: {Id}", id);
            var updatedOffice = await service.UpdateOfficeAsync(id, office);
            if (updatedOffice is null)
            {
                logger.LogWarning("Office with Id: {Id} not found for update", id);
                return Results.NotFound();
            }
            return Results.Ok(updatedOffice);
        })
        .RequireAuthorization()
        .WithName("UpdateOffice")
        .WithSummary("Update office")
        .WithDescription("Updates an existing office location's details.");

        group.MapDelete("/{id}", async (Guid id, OfficeService service, ILoggerFactory loggerFactory) =>
        {
            var logger = loggerFactory.CreateLogger("OfficeEndpoints");
            logger.LogInformation("Deleting office with Id: {Id}", id);
            var deleted = await service.DeleteOfficeAsync(id);
            if (!deleted)
            {
                logger.LogWarning("Office with Id: {Id} not found for deletion", id);
                return Results.NotFound();
            }
            return Results.NoContent();
        })
        .RequireAuthorization()
        .WithName("DeleteOffice")
        .WithSummary("Delete office")
        .WithDescription("Deletes an office location by its unique ID.");
    }
}
