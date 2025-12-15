using bookings_api.Models;
using bookings_api.Models.DTOs;
using bookings_api.Services;
using Microsoft.AspNetCore.Mvc;

namespace bookings_api.Endpoints;

public static class BookingEndpoints
{
    public static void MapBookingEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/bookings")
            .WithTags("Bookings")
            .WithOpenApi();

        group.MapGet("/", async (BookingService service, ILoggerFactory loggerFactory) =>
        {
            var logger = loggerFactory.CreateLogger("BookingEndpoints");
            logger.LogInformation("Getting all bookings");
            var bookings = await service.GetAllBookingsAsync();
            var dtos = bookings.Select(b => new BookingDto
            {
                Id = b.Id,
                DeskId = b.DeskId,
                StaffMemberId = b.StaffMemberId,
                Date = b.BookingDate,
                BookingType = (int)b.BookingType
            });
            return Results.Ok(dtos);
        })
        .WithName("GetAllBookings");

        group.MapGet("/{id}", async (int id, BookingService service, ILoggerFactory loggerFactory) =>
        {
            var logger = loggerFactory.CreateLogger("BookingEndpoints");
            logger.LogInformation("Getting booking with Id: {Id}", id);
            var booking = await service.GetBookingByIdAsync(id);
            if (booking is null)
            {
                logger.LogWarning("Booking with Id: {Id} not found", id);
                return Results.NotFound();
            }
            var dto = new BookingDto
            {
                Id = booking.Id,
                DeskId = booking.DeskId,
                StaffMemberId = booking.StaffMemberId,
                Date = booking.BookingDate,
                BookingType = (int)booking.BookingType
            };
            return Results.Ok(dto);
        })
        .WithName("GetBookingById");

        group.MapPost("/", async ([FromBody] Booking booking, BookingService service, ILoggerFactory loggerFactory) =>
        {
            var logger = loggerFactory.CreateLogger("BookingEndpoints");
            logger.LogInformation("Creating new booking for DeskId: {DeskId}", booking.DeskId);
            var createdBooking = await service.CreateBookingAsync(booking);
            var dto = new BookingDto
            {
                Id = createdBooking.Id,
                DeskId = createdBooking.DeskId,
                StaffMemberId = createdBooking.StaffMemberId,
                Date = createdBooking.BookingDate,
                BookingType = (int)createdBooking.BookingType
            };
            return Results.Created($"/api/bookings/{createdBooking.Id}", dto);
        })
        .WithName("CreateBooking");

        group.MapPut("/{id}", async (int id, [FromBody] Booking booking, BookingService service, ILoggerFactory loggerFactory) =>
        {
            var logger = loggerFactory.CreateLogger("BookingEndpoints");
            logger.LogInformation("Updating booking with Id: {Id}", id);
            var updatedBooking = await service.UpdateBookingAsync(id, booking);
            if (updatedBooking is null)
            {
                logger.LogWarning("Booking with Id: {Id} not found for update", id);
                return Results.NotFound();
            }
            var dto = new BookingDto
            {
                Id = updatedBooking.Id,
                DeskId = updatedBooking.DeskId,
                StaffMemberId = updatedBooking.StaffMemberId,
                Date = updatedBooking.BookingDate,
                BookingType = (int)updatedBooking.BookingType
            };
            return Results.Ok(dto);
        })
        .WithName("UpdateBooking");

        group.MapDelete("/{id}", async (int id, BookingService service, ILoggerFactory loggerFactory) =>
        {
            var logger = loggerFactory.CreateLogger("BookingEndpoints");
            logger.LogInformation("Deleting booking with Id: {Id}", id);
            var deleted = await service.DeleteBookingAsync(id);
            if (!deleted)
            {
                logger.LogWarning("Booking with Id: {Id} not found for deletion", id);
                return Results.NotFound();
            }
            return Results.NoContent();
        })
        .WithName("DeleteBooking");

        group.MapGet("/by-date", async ([FromQuery] DateTime? date, BookingService service, ILoggerFactory loggerFactory) =>
        {
            var logger = loggerFactory.CreateLogger("BookingEndpoints");
            var queryDate = date ?? DateTime.UtcNow.Date;

             if (queryDate.Kind == DateTimeKind.Unspecified)
                queryDate = DateTime.SpecifyKind(queryDate, DateTimeKind.Utc);
            else if (queryDate.Kind == DateTimeKind.Local)
                queryDate = queryDate.ToUniversalTime();

            logger.LogInformation("Getting bookings for date: {Date}", queryDate);
            var bookings = await service.GetBookingsByDateAsync(queryDate);
            var dtos = bookings.Select(b => new BookingDto
            {
                Id = b.Id,
                DeskId = b.DeskId,
                StaffMemberId = b.StaffMemberId,
                Date = b.BookingDate,
                BookingType = (int)b.BookingType
            });
            return Results.Ok(dtos);
        })
        .WithName("GetBookingsByDate");

        group.MapGet("/stats", async ([FromQuery] Guid officeId, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate, BookingService service, ILoggerFactory loggerFactory) =>
        {
            var logger = loggerFactory.CreateLogger("BookingEndpoints");
            var start = startDate ?? DateTime.UtcNow.Date;
            var end = endDate ?? start.AddMonths(1);

            // PostgreSQL requires UTC for timestamp with time zone
            if (start.Kind == DateTimeKind.Unspecified)
                start = DateTime.SpecifyKind(start, DateTimeKind.Utc);
            else if (start.Kind == DateTimeKind.Local)
                start = start.ToUniversalTime();

            if (end.Kind == DateTimeKind.Unspecified)
                end = DateTime.SpecifyKind(end, DateTimeKind.Utc);
            else if (end.Kind == DateTimeKind.Local)
                end = end.ToUniversalTime();
            
            logger.LogInformation("Getting booking stats for OfficeId: {OfficeId} from {Start} to {End}", officeId, start, end);
            
            var stats = await service.GetDailyBookingCountsAsync(officeId, start, end);
            return Results.Ok(stats);
        })
        .WithName("GetBookingStats");

        group.MapGet("/my", async (HttpContext httpContext, BookingService service, StaffMemberService staffService, ILoggerFactory loggerFactory) =>
        {
            var logger = loggerFactory.CreateLogger("BookingEndpoints");
            
            // Extract user data from claims (similar to StaffMemberEndpoints)
            var userId = httpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var email = httpContext.User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

            if (string.IsNullOrEmpty(userId) && string.IsNullOrEmpty(email))
            {
                logger.LogWarning("User ID and Email not found in token");
                return Results.Unauthorized();
            }

            // Find the staff member
            StaffMember? staffMember = null;
            if (!string.IsNullOrEmpty(email))
            {
                staffMember = await staffService.GetStaffMemberByEmailAsync(email);
            }
            
            if (staffMember == null)
            {
                 logger.LogWarning("Staff member not found for authenticated user");
                 return Results.NotFound("Staff member profile not found.");
            }

            logger.LogInformation("Getting bookings for StaffMemberId: {StaffMemberId}", staffMember.Id);
            var bookings = await service.GetBookingsByStaffMemberIdAsync(staffMember.Id);
            
            var dtos = bookings.Select(b => new BookingDto
            {
                Id = b.Id,
                DeskId = b.DeskId,
                StaffMemberId = b.StaffMemberId,
                Date = b.BookingDate,
                BookingType = (int)b.BookingType
            });
            return Results.Ok(dtos);
        })
        .RequireAuthorization()
        .WithName("GetMyBookings");
    }
}
