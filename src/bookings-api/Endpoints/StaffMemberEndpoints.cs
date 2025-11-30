using bookings_api.Models;
using bookings_api.Services;
using Microsoft.AspNetCore.Mvc;

namespace bookings_api.Endpoints;

public static class StaffMemberEndpoints
{
    public static void MapStaffMemberEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/staffmembers")
            .WithTags("StaffMembers")
            .WithOpenApi();

        group.MapGet("/", async (StaffMemberService service, ILoggerFactory loggerFactory) =>
        {
            var logger = loggerFactory.CreateLogger("StaffMemberEndpoints");
            logger.LogInformation("Getting all staff members");
            return Results.Ok(await service.GetAllStaffMembersAsync());
        })
        .WithName("GetAllStaffMembers");

        group.MapGet("/{id}", async (Guid id, StaffMemberService service, ILoggerFactory loggerFactory) =>
        {
            var logger = loggerFactory.CreateLogger("StaffMemberEndpoints");
            logger.LogInformation("Getting staff member with Id: {Id}", id);
            var staffMember = await service.GetStaffMemberByIdAsync(id);
            if (staffMember is null)
            {
                logger.LogWarning("Staff member with Id: {Id} not found", id);
                return Results.NotFound();
            }
            return Results.Ok(staffMember);
        })
        .WithName("GetStaffMemberById");

        group.MapPost("/", async ([FromBody] StaffMember staffMember, StaffMemberService service, ILoggerFactory loggerFactory) =>
        {
            var logger = loggerFactory.CreateLogger("StaffMemberEndpoints");
            logger.LogInformation("Creating new staff member: {Name}", staffMember.Name);
            var createdStaffMember = await service.CreateStaffMemberAsync(staffMember);
            return Results.Created($"/api/staffmembers/{createdStaffMember.Id}", createdStaffMember);
        })
        .WithName("CreateStaffMember");

        group.MapPut("/{id}", async (Guid id, [FromBody] StaffMember staffMember, StaffMemberService service, ILoggerFactory loggerFactory) =>
        {
            var logger = loggerFactory.CreateLogger("StaffMemberEndpoints");
            logger.LogInformation("Updating staff member with Id: {Id}", id);
            var updatedStaffMember = await service.UpdateStaffMemberAsync(id, staffMember);
            if (updatedStaffMember is null)
            {
                logger.LogWarning("Staff member with Id: {Id} not found for update", id);
                return Results.NotFound();
            }
            return Results.Ok(updatedStaffMember);
        })
        .WithName("UpdateStaffMember");

        group.MapDelete("/{id}", async (Guid id, StaffMemberService service, ILoggerFactory loggerFactory) =>
        {
            var logger = loggerFactory.CreateLogger("StaffMemberEndpoints");
            logger.LogInformation("Deleting staff member with Id: {Id}", id);
            var deleted = await service.DeleteStaffMemberAsync(id);
            if (!deleted)
            {
                logger.LogWarning("Staff member with Id: {Id} not found for deletion", id);
                return Results.NotFound();
            }
            return Results.NoContent();
        })
        .WithName("DeleteStaffMember");
    }
}
