using FirebaseAdmin;
using FirebaseAdmin.Auth;

namespace bookings_api.Services;

public class AuthClaimService : IAuthClaimService
{
    private readonly ILogger<AuthClaimService> _logger;

    public AuthClaimService(ILogger<AuthClaimService> logger)
    {
        _logger = logger;
    }

    public async Task SetUserRoleAsync(string firebaseUid, string role)
    {
        if (string.IsNullOrEmpty(firebaseUid))
        {
            _logger.LogWarning("Cannot set role, firebaseUid is empty.");
            return;
        }

        try
        {
            var user = await FirebaseAuth.DefaultInstance.GetUserAsync(firebaseUid);
            
            // Get existing claims to avoid overwriting them
            var claims = user.CustomClaims != null 
                ? new Dictionary<string, object>(user.CustomClaims) 
                : new Dictionary<string, object>();

            claims["role"] = role;

            await FirebaseAuth.DefaultInstance.SetCustomUserClaimsAsync(firebaseUid, claims);
            _logger.LogInformation("Successfully set role {Role} for Firebase UID {Uid}", role, firebaseUid);
        }
        catch (FirebaseException ex)
        {
            _logger.LogError(ex, "Firebase exception while setting user role for UID {Uid}", firebaseUid);
            throw; // Re-throw or handle depending on whether we want API to fail if Firebase claims fail
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error setting user role for UID {Uid}", firebaseUid);
            throw;
        }
    }

    public async Task RemoveUserRoleAsync(string firebaseUid)
    {
        if (string.IsNullOrEmpty(firebaseUid))
        {
            return;
        }

        try
        {
            var user = await FirebaseAuth.DefaultInstance.GetUserAsync(firebaseUid);
            
            if (user.CustomClaims != null && user.CustomClaims.ContainsKey("role"))
            {
                var claims = new Dictionary<string, object>(user.CustomClaims);
                claims.Remove("role");
                
                await FirebaseAuth.DefaultInstance.SetCustomUserClaimsAsync(firebaseUid, claims);
                _logger.LogInformation("Successfully removed role for Firebase UID {Uid}", firebaseUid);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing user role for UID {Uid}", firebaseUid);
            throw;
        }
    }
}
