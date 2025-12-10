using System.Text.Json.Serialization;

namespace bookings_api.Models;

public class AuthenticatedUser
{
    public string UserId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool EmailVerified { get; set; }
    public FirebaseClaims? Firebase { get; set; }
}

public class FirebaseClaims
{
    [JsonPropertyName("identities")]
    public FirebaseIdentities? Identities { get; set; }
    
    [JsonPropertyName("sign_in_provider")]
    public string SignInProvider { get; set; } = string.Empty;
}

public class FirebaseIdentities
{
    [JsonPropertyName("email")]
    public List<string>? Email { get; set; }
}
