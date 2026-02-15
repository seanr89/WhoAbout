# NoteForge Client

The frontend client for the NoteForge desk booking system. Built with React, TypeScript, and Vite.

## 🚀 Tech Stack

- **Framework**: [React](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Routing**: [React Router](https://reactrouter.com/)

## 🛠️ Setup & Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/)

### Installation

1. Navigate to the client directory:
   ```bash
   cd src/booking-client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env.local` file in the `src/booking-client` directory with the following variables:

   ```env
   VITE_API_BASE_URL=http://localhost:8080
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

   > **Note:** You can obtain the Firebase configuration from your Firebase Console project settings.

## 🏃 Running the App

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## 📱 Features

- **User Authentication**: Login and Registration via Firebase.
- **Booking Dashboard**: View available desks and make bookings.
- **Admin Dashboard**: Manage offices, desks, and view all bookings (Admin/Owner only).
- **Profile Management**: View and update user profile.
- **My Bookings**: View personal booking history.
- **Responsive Design**: optimized for desktop and tablet usage.

## 🧪 Testing

*Currently, no frontend tests are implemented. See the main [TODO.md](../../TODO.md) for future plans.*
