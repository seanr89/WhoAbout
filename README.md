# WhoAbout

WhoAbout is an office desk booking and monitoring system designed with agentic development in mind. It separates the backend logic and frontend presentation to allow for scalable and maintainable development.

## 🚀 Tech Stack

### Backend
- **Framework**: ASP.NET Core Web API (NET 10.0)
- **Database**: PostgreSQL (via Entity Framework Core)
- **Authentication**: Firebase Admin SDK
- **Containerization**: Docker

### Frontend
- **Framework**: React (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Authentication
- **State Management**: React Context

---

## 📂 Project Structure

```
WhoAbout/
├── src/
│   ├── bookings-api/       # .NET Web API Backend
│   │   ├── Data/          # EF Core DbContext and Initializers
│   │   ├── Endpoints/     # Minimal API Endpoints
│   │   ├── Models/        # Domain Models & DTOs
│   │   └── Services/      # Business Logic Services
│   │   
│   └── booking-client/     # React Frontend
│       ├── src/
│       │   ├── components/ # React Components (Screens & UI)
│       │   ├── contexts/   # React Contexts (Auth)
│       │   ├── services/   # API Clients
│       │   └── types/      # TypeScript Interfaces
├── docker-compose.yml      # Docker Composition for Full Stack (or DB only)
└── Makefile                # Shortcuts for common tasks
```

---

## 🛠️ Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Recommended)
- [Node.js](https://nodejs.org/) (v18+)
- [.NET SDK](https://dotnet.microsoft.com/download) (v10.0)

### Quick Start (Docker)

Use the provided `Makefile` to get up and running quickly:

```bash
# Build and start all services (Postgres, API)
make compose-up
```

### Manual Development Setup

#### 1. Database & Backend
Ensure Docker is running for the database:

```bash
# Start Postgres only
make compose-postgres
```

Run the backend API:

```bash
cd src/bookings-api
dotnet restore
dotnet run
```
The API will be available at `http://localhost:8080` (or the port specified in launchSettings/docker).

#### 2. Frontend Client
In a new terminal:

```bash
cd src/booking-client
npm install
npm run dev
```
The client will serve at `http://localhost:5173`.

---

## 🔧 Configuration

### Environment Variables
- **Backend**: `src/bookings-api/appsettings.json` (or `appsettings.Development.json`)
- **Frontend**: `src/booking-client/.env.local`

Example `.env.local` for frontend:
```
VITE_API_BASE_URL=http://localhost:8080
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
...
```

---

## 📦 Make Commands

The project includes a `Makefile` for convenience:

| Command | Description |
|---------|-------------|
| `make help` | Show available commands |
| `make compose-build` | Build Docker images |
| `make compose-up` | Start services (detached) |
| `make compose-down` | Stop services |
| `make compose-logs` | Tail logs |
| `make db-migrate-add NAME=X` | Add EF Core Migration |

---

## 📝 TODOs & Future Roadmap

See [TODO.md](TODO.md) for a list of known issues, missing features, and technical debt.


### Plan Notes - Auth
As part of new UI, I want to implement in support to control who can view what screens, such as users with either Admin or Owner role access to be able to see the admin pages and controls.
Additionally, include an inidividuals role level on the profile screen so they can see what it is.