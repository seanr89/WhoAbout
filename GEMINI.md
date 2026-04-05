# WhoAbout Project Overview

WhoAbout is an office desk booking and monitoring system designed with a clean separation between frontend and backend. This document serves as a guide for understanding the project structure and development conventions.

## 🏗️ Application Structure

The project is organized into two primary components within the `src/` directory:

### 1. Frontend: `src/booking-client`
A modern, responsive web application built for desk reservations and administrative management.
- **Framework:** React (Vite-based)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State & Auth:** React Context API and Firebase Authentication
- **Key Directories:**
  - `src/components/`: Contains all UI screens (e.g., `BookingScreen`, `AdminScreen`) and reusable components.
  - `src/services/`: API client logic using `fetch` to communicate with the backend.
  - `src/contexts/`: Authentication and global state management.

### 2. Backend: `src/bookings-api`
A high-performance Minimal API providing the business logic and data persistence.
- **Framework:** ASP.NET Core (.NET 10.0)
- **Architecture:** Minimal APIs with Service-based business logic.
- **Database:** PostgreSQL via Entity Framework Core (EF Core).
- **Authentication:** Firebase Admin SDK for JWT validation and role-based access.
- **Key Directories:**
  - `Endpoints/`: Contains the route definitions and request handling (Minimal API style).
  - `Services/`: Houses the core business logic (e.g., `BookingService`, `DeskService`).
  - `Models/`: Domain entities and Data Transfer Objects (DTOs).
  - `Data/`: EF Core `DbContext` and database initialization logic.

---

## 🛠️ Tech Stack & Integration

- **Authentication:** Unified via Firebase. The client handles sign-in, while the API validates tokens and manages user profiles/roles in the local database.
- **Orchestration:** Docker and `docker-compose` are used to manage the PostgreSQL database and API environment.
- **Automation:** A root-level `Makefile` provides shortcuts for common development tasks:
  - `make compose-up`: Starts the full stack.
  - `make db-migrate-add`: Simplifies EF Core migration creation.
- **Testing:**
  - Backend tests are located in `src/bookings-api.tests` using xUnit.
  - Frontend testing is a planned future addition.

---

## 📋 Development Principles

- **Agentic Development:** This codebase is optimized for AI-assisted development with clear separation of concerns and descriptive naming conventions.
- **Minimalist API:** The backend favors the Minimal API pattern for reduced boilerplate and faster performance.
- **Surgical Changes:** When modifying the codebase, prioritize maintaining existing architectural patterns (e.g., keeping logic in Services, not Endpoints).
- **Documentation:** Refer to `TODO.md` for current priorities and technical debt.
