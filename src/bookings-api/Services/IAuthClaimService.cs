using System.Threading.Tasks;

namespace bookings_api.Services;

public interface IAuthClaimService
{
    /// <summary>
    /// Sets the user's role in their Firebase Custom Claims.
    /// Preserves any other existing custom claims the user might have.
    /// </summary>
    /// <param name="firebaseUid">The Firebase User ID</param>
    /// <param name="role">The role to set (e.g. 'Admin', 'Employee')</param>
    Task SetUserRoleAsync(string firebaseUid, string role);

    /// <summary>
    /// Removes the role claim from the user's Firebase Custom Claims.
    /// </summary>
    /// <param name="firebaseUid">The Firebase User ID</param>
    Task RemoveUserRoleAsync(string firebaseUid);
}
