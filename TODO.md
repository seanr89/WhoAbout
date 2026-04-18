# WhoAbout TODOs & Roadmap

This file tracks planned features, known bugs, and technical debt for the WhoAbout project.

## 🐛 Bugs & Issues

- [ ] **Profile Updates**: Logic for updating user profiles in `ProfileScreen` is incomplete or needs verification (see comments in `App.tsx`). Ensure updates reflect immediately in the UI without a full reload.
- [ ] **Health Checks**: The commented-out `app.MapHealthChecks` in `Program.cs` suggests standard health checks are not fully implemented. Review and enable proper health checks.
- [ ] **Error Handling**: Standardize API error responses across all endpoints.
- [x] **OpenAPI Config**: Address `// Learn more about configuring OpenAPI...` in `Program.cs` and ensure Swagger/OpenAPI documentation is fully configured and accurate.

## ✨ New Features

- [ ] **Frontend Testing**: Add a testing framework (e.g., Vitest, React Testing Library) to `booking-client` and implement unit/integration tests for critical components.
- [ ] **CI/CD Pipeline**: implement GitHub Actions or similar for automated building, testing, and deployment.
- [ ] **Desk Map Visualization**: Add a visual map for desk selection instead of a list view.
- [ ] **Recurring Bookings**: Allow users to book desks for recurring dates.
- [ ] **Notifications**: Implement email or push notifications for booking confirmations and reminders.

## 🔧 Technical Debt & Refactoring

- [x] **Rename "WhoAbout"**: Ensure all internal code references (namespaces, variables, comments) are updated from "NoteForge" to "WhoAbout" where appropriate.
- [x] **Linting & Formatting**: Add ESLint and Prettier configuration to `booking-client` to enforce code style.
- [ ] **Environment Variables**: Centralize and document all environment variables for both client and API in a single reference document.
