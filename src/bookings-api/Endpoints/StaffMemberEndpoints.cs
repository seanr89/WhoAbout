using bookings_api.Models;
using bookings_api.Models.DTOs;
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
            var staffMembers = await service.GetAllStaffMembersAsync();
            var dtos = staffMembers.Select(s => new StaffMemberDto
            {
                Id = s.Id,
                Name = s.Name,
                Email = s.Email,
                IsActive = s.IsActive
            });
            return Results.Ok(dtos);
        })
        .WithName("GetAllStaffMembers");

        group.MapGet("/me", async (HttpContext httpContext, StaffMemberService service, ILoggerFactory loggerFactory) =>
        {
            var logger = loggerFactory.CreateLogger("StaffMemberEndpoints");
            
            // Extract user data from claims
            var claims = httpContext.User.Claims.ToList();
            var firebaseClaim = claims.FirstOrDefault(c => c.Type == "firebase")?.Value;
            
            var user = new AuthenticatedUser
            {
                UserId = httpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "",
                Email = httpContext.User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? "",
                EmailVerified = bool.TryParse(claims.FirstOrDefault(c => c.Type == "email_verified")?.Value, out var verified) && verified,
                Firebase = !string.IsNullOrEmpty(firebaseClaim) 
                    ? System.Text.Json.JsonSerializer.Deserialize<FirebaseClaims>(firebaseClaim) 
                    : null
            };

            logger.LogInformation("Authenticated User: {@User}", user);

            if (string.IsNullOrEmpty(user.UserId))
            {
                logger.LogWarning("User ID not found in token");
                return Results.Unauthorized();
            }

            logger.LogInformation("Getting staff member for User Id: {UserId}", user.UserId);
            var staffMember = await service.GetStaffMemberByUserIdAsync(user.UserId);
            var staffMemberByEmail = await service.GetStaffMemberByEmailAsync(user.Email);
            
            if (staffMember is null)
            {
                logger.LogWarning("Staff member with User Id: {UserId} not found", user.UserId);
                // Optional: Return the authenticated user info even if profile not found, 
                // so the client can decide to register.
                // For now, adhering to previous behavior of 404.
                return Results.NotFound();
            }

            //todo: check if staff member has the userid populated, if not, update it
            if (staffMemberByEmail is not null && staffMember.UserId == null)
            {
                staffMember.UserId = user.UserId;
                await service.UpdateStaffMemberAsync(staffMember.Id, staffMember);
            }
            
            return Results.Ok(staffMember);
        })
        .RequireAuthorization()
        .WithName("GetCurrentStaffMember");

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
