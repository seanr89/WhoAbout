# Fireclaims App Context and Reusability Plan

## 1. Application Context & Purpose
The `fireclaims` application is currently serving as a practice/proof-of-concept project demonstrating how to integrate **Firebase Authentication** within an ASP.NET Core Minimal API application. 

Currently, the application mixes routing, structural configuration, and authentication logic:
* **JWT Validation:** Setup in `Program.cs` to validate tokens issued by Google's Secure Token service.
* **Claims Transformation:** Handled by a local `ClaimsTransformer` class (implementing `IClaimsTransformation`) that intercepts valid tokens and enriches the user principal with dynamic claims (like `access_level`).
* **Claims Management:** Admin-level operations to mutate custom claims via the Firebase Admin SDK inside `UserEndpoint.cs`.

While this tightly-coupled approach works for a standalone demo, it limits reusability if you ever want to stand up another microservice or application that requires the exact same Firebase Auth and Claims enrichment rules.

---

## 2. Plan: Extracting to an `AuthClaimService`
To reuse this logic in future applications, the Firebase Authentication validation, claims transformation, and Firebase Admin SDK manipulations need to be extracted into a portable module.

### Step 1: Create a Shared Library (NuGet or Project Reference)
Instead of keeping the auth logic inside a specific Web API, create a standalone Class Library project (e.g., `MyCompany.Shared.Auth`). This library will house all Firebase and Claims logic so any future API can simply reference it.

### Step 2: Extract Auth Management into `IAuthClaimService`
Create a dedicated service to encapsulate the Firebase Admin SDK operations that currently live in the Minimal API endpoint. By keeping this behind an interface, you make it testable and reusable.

```csharp
public interface IAuthClaimService
{
    Task SetUserRoleAsync(string uid, string role);
    Task AssignPremiumStatusAsync(string uid, bool isPremium);
}

public class AuthClaimService : IAuthClaimService
{
    public async Task SetUserRoleAsync(string uid, string role)
    {
        var claims = new Dictionary<string, object>() { { "role", role } };
        await FirebaseAuth.DefaultInstance.SetCustomUserClaimsAsync(uid, claims);
    }
    // ...
}
```

### Step 3: Extract and Generalize the Claims Transformation
Move the `ClaimsTransformer` to the shared library. If the logic for deriving an `access_level` requires querying a database, abstract that data fetching behind a repository interface so the shared auth library isn't tightly coupled to a specific database technology.

```csharp
public class SharedClaimsTransformer : IClaimsTransformation
{
    // Inject any needed dependencies here (e.g. cache service, database lookup)
    public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        // Add claim logic...
        return Task.FromResult(principal);
    }
}
```

### Step 4: Create a Dependency Injection Extension Builder
Create an extension method on `IServiceCollection` inside the shared library. This makes consuming the auth logic a one-liner in any future app's `Program.cs`.

```csharp
public static class AuthExtensions
{
    public static IServiceCollection AddFirebaseClaimsAuth(this IServiceCollection services, string projectId)
    {
        // 1. Configure JWT Bearer validation
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.Authority = $"https://securetoken.google.com/{projectId}";
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    // Validation rules...
                };
            });

        // 2. Register Global Authorization
        services.AddAuthorization();

        // 3. Register Claims Transformation
        services.AddTransient<IClaimsTransformation, SharedClaimsTransformer>();

        // 4. Register the AuthClaimService
        services.AddScoped<IAuthClaimService, AuthClaimService>();

        return services;
    }
}
```

## 3. Usage in a Future App
With the plan above executed, implementing Firebase authentication and advanced claims in **any** future .NET back-end becomes incredibly straightforward:

**FutureApp/Program.cs**
```csharp
var builder = WebApplication.CreateBuilder(args);

// ... Add standard services ...

// One-liner to add all Firebase & Claims logic
builder.Services.AddFirebaseClaimsAuth(builder.Configuration["Firebase:ProjectId"]);

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();
```

When custom claim manipulation is needed, the future app simply injects `IAuthClaimService` into its constructors or Minimal API delegates.
