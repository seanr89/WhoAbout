using Microsoft.EntityFrameworkCore;
using bookings_api.Data;
using Scalar.AspNetCore;
using bookings_api.Services;
using bookings_api.Endpoints;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;

// Load .env file
DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Initialize Firebase Admin SDK
if (FirebaseApp.DefaultInstance == null)
{
    try
    {
        FirebaseApp.Create();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Warning: Failed to initialize FirebaseApp. Ensure GOOGLE_APPLICATION_CREDENTIALS is set in .env if using admin SDK. Error: {ex.Message}");
    }
}

// Add services to the container.
// Configure OpenAPI documentation
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        document.Info = new()
        {
            Title = "WhoAbout Bookings API",
            Version = "v1",
            Description = "API for the WhoAbout office desk booking system. Authenticate using Firebase JWT."
        };
        return Task.CompletedTask;
    });

    options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        var scheme = new Microsoft.OpenApi.Models.OpenApiSecurityScheme
        {
            Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
            Name = "Authorization",
            Scheme = "Bearer",
            In = Microsoft.OpenApi.Models.ParameterLocation.Header,
            Description = "Please enter Firebase JWT token",
            Reference = new Microsoft.OpenApi.Models.OpenApiReference
            {
                Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                Id = "Bearer"
            }
        };

        document.Components ??= new Microsoft.OpenApi.Models.OpenApiComponents();
        document.Components.SecuritySchemes ??= new Dictionary<string, Microsoft.OpenApi.Models.OpenApiSecurityScheme>();
        document.Components.SecuritySchemes["Bearer"] = scheme;

        document.SecurityRequirements ??= new List<Microsoft.OpenApi.Models.OpenApiSecurityRequirement>();
        document.SecurityRequirements.Add(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
        {
            { scheme, Array.Empty<string>() }
        });

        return Task.CompletedTask;
    });
});
builder.Services.AddHealthChecks();

//efcore support to db to json for circular dependencies in models

builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options =>
{
    options.SerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddApiServices();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["Firebase:Authority"];
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Firebase:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Firebase:Audience"],
            ValidateLifetime = true
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
app.MapOpenApi();
app.MapScalarApiReference(options =>
{
    options.WithTitle("Bookings API");
    options.WithTheme(ScalarTheme.DeepSpace);
    options.WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient);
});

app.UseHttpsRedirection();
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();


app.MapApiEndpoints();

using (var scope = app.Services.CreateScope())
{
    var setup = scope.ServiceProvider.GetRequiredService<DbInitializationSetup>();
    await setup.InitializeDatabaseAsync();
}

app.Run();
