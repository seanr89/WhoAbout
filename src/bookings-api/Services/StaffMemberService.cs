using bookings_api.Data;
using bookings_api.Models;
using Microsoft.EntityFrameworkCore;

namespace bookings_api.Services;

public class StaffMemberService
{
    private readonly AppDbContext _context;
    private readonly IAuthClaimService _authClaimService;

    public StaffMemberService(AppDbContext context, IAuthClaimService authClaimService)
    {
        _context = context;
        _authClaimService = authClaimService;
    }

    public async Task<List<StaffMember>> GetAllStaffMembersAsync()
    {
        return await _context.StaffMembers.ToListAsync();
    }

    public async Task<StaffMember?> GetStaffMemberByIdAsync(Guid id)
    {
        return await _context.StaffMembers.FindAsync(id);
    }

    public async Task<StaffMember?> GetStaffMemberByUserIdAsync(string userId)
    {
        return await _context.StaffMembers.FirstOrDefaultAsync(s => s.UserId == userId);
    }

    public async Task<StaffMember?> GetStaffMemberByEmailAsync(string email)
    {
        return await _context.StaffMembers.FirstOrDefaultAsync(s => s.Email == email);
    }

    public async Task<StaffMember> CreateStaffMemberAsync(StaffMember staffMember)
    {
        _context.StaffMembers.Add(staffMember);
        await _context.SaveChangesAsync();

        if (!string.IsNullOrEmpty(staffMember.UserId))
        {
            await _authClaimService.SetUserRoleAsync(staffMember.UserId, staffMember.Role.ToString());
        }

        return staffMember;
    }

    public async Task<StaffMember?> UpdateStaffMemberAsync(Guid id, StaffMember staffMember)
    {
        var existingStaffMember = await _context.StaffMembers.FindAsync(id);
        if (existingStaffMember == null)
        {
            return null;
        }

        existingStaffMember.Name = staffMember.Name;
        existingStaffMember.Email = staffMember.Email;
        existingStaffMember.IsActive = staffMember.IsActive;
        existingStaffMember.Role = staffMember.Role;
        existingStaffMember.UserId = staffMember.UserId; // Ensure UserId is updated if it was passed

        await _context.SaveChangesAsync();

        if (!string.IsNullOrEmpty(existingStaffMember.UserId))
        {
            await _authClaimService.SetUserRoleAsync(existingStaffMember.UserId, existingStaffMember.Role.ToString());
        }

        return existingStaffMember;
    }

    public async Task<bool> DeleteStaffMemberAsync(Guid id)
    {
        var staffMember = await _context.StaffMembers.FindAsync(id);
        if (staffMember == null)
        {
            return false;
        }

        if (!string.IsNullOrEmpty(staffMember.UserId))
        {
            await _authClaimService.RemoveUserRoleAsync(staffMember.UserId);
        }

        _context.StaffMembers.Remove(staffMember);
        await _context.SaveChangesAsync();
        return true;
    }
}
