# NoteForge API

The backend API for the NoteForge desk booking system. Built with ASP.NET Core and Entity Framework Core.

## 🚀 Tech Stack

- **Framework**: ASP.NET Core Web API (.NET 10.0)
- **Database**: PostgreSQL (via Entity Framework Core)
- **Authentication**: Firebase Admin SDK (JWT Validation)
- **Containerization**: Docker
- **Testing**: xUnit, EF Core InMemory

## 🛠️ Setup & Installation

### Prerequisites

- [.NET SDK](https://dotnet.microsoft.com/download/dotnet/10.0) (v10.0)
- [PostgreSQL](https://www.postgresql.org/) (or use Docker)
- [Docker](https://www.docker.com/) (Optional but recommended)

### Configuration

Create an `appsettings.json` or `appsettings.Development.json` file in `src/bookings-api/` with the following structure:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=bookings_db;Username=postgres;Password=yourpassword"
  },
  "Firebase": {
    "Authority": "https://securetoken.google.com/your-project-id",
    "Issuer": "https://securetoken.google.com/your-project-id",
    "Audience": "your-project-id"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

Or use a `.env` file in the project root if configured.

### Running the API

1. Navigate to the API directory:
   ```bash
   cd src/bookings-api
   ```

2. Restore dependencies:
   ```bash
   dotnet restore
   ```

3. Run the application:
   ```bash
   dotnet run
   ```
   The API will be available at `http://localhost:8080`.

## 🐳 Docker Support

To run the API using Docker (part of the full stack composition):

```bash
make compose-up
```

This will start both the PostgreSQL database and the API service.

## 🔌 API Endpoints

The API exposes the following main resources:

- **Auth**: Firebase JWT token validation is required for most endpoints.
- **Offices** (`/api/offices`): Manage office locations.
- **Desks** (`/api/desks`): Manage desks within offices.
- **Bookings** (`/api/bookings`): Create, view, and cancel desk bookings.
- **StaffMembers** (`/api/staffmembers`): Manage staff profiles and roles.
- **DeskReleases** (`/api/deskreleases`): Manage desk releases for assigned desks.
- **Health Check** (`/healthcheck`): Simple service health verification.

## 🧪 Testing

Unit tests are located in `../bookings-api.tests`.

To run tests from the `src/bookings-api` directory:
```bash
dotnet test ../bookings-api.tests
```
