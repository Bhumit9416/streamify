# Fullstack Chat App (MERN Stack)

This is a fullstack chat and video calling application built with the MERN (MongoDB, Express, React, Node.js) stack.

## 🏗️ Project Structure:

-   **`backend/`**: Contains the Node.js/Express server with MongoDB integration.
-   **`frontend/`**: Contains the React application built with Vite.

## 🚀 Key Features:

-   **Separate Development Servers**: Backend runs on port 5001, Frontend on port 5173.
-   **Real-time Communication**: Socket.IO for instant messaging and typing indicators.
-   **Authentication System**: JWT-based with secure password hashing (bcrypt).
-   **Database Integration**: MongoDB using Mongoose for data persistence.
-   **Video Calling**: Stream SDK integration for real-time video calls.
-   **User Profiles**: Manage user information, including native and learning languages.
-   **Theming**: Basic light/dark theme support.

## ⚙️ Technologies Used:

### Backend:
-   **Node.js**
-   **Express.js**
-   **MongoDB** (with Mongoose ODM)
-   **Socket.IO**
-   **JWT** (jsonwebtoken)
-   **Bcrypt.js**
-   **Stream Chat & Video SDK** (server-side token generation)

### Frontend:
-   **React 18**
-   **Vite**
-   **TypeScript**
-   **Tailwind CSS**
-   **Zustand** (state management)
-   **React Query** (data fetching)
-   **React Router DOM** (client-side routing)
-   **Socket.IO Client**
-   **Stream Video React SDK**
-   **Shadcn/ui** (components)

## 📦 Installation & Setup:

1.  **Clone the repository:**
    \`\`\`bash
    git clone <your-repo-url>
    cd fullstack-chat-app-mern
    \`\`\`

2.  **Install dependencies for both frontend and backend:**
    \`\`\`bash
    npm run install:all
    \`\`\`
    This command will run `npm install` in both `backend/` and `frontend/` directories.

3.  **Configure Environment Variables:**
    Create `.env` files in both the `backend/` and `frontend/` directories based on their respective `.env.example` files.

    **`backend/.env`**:
    \`\`\`env
    PORT=5001
    FRONTEND_URL=http://localhost:5173
    MONGO_URI=mongodb://localhost:27017/chatapp # Replace with your MongoDB connection string
    JWT_SECRET=your_jwt_secret_key_here # Generate a strong, random key
    STREAM_API_KEY=your_stream_api_key # Get from Stream Dashboard
    STREAM_API_SECRET=your_stream_api_secret # Get from Stream Dashboard
    \`\`\`

    **`frontend/.env`**:
    \`\`\`env
    VITE_API_URL=http://localhost:5001/api
    VITE_APP_NAME=ChatApp
    VITE_APP_VERSION=1.0.0
    \`\`\`

4.  **Start the Development Servers:**
    \`\`\`bash
    npm run dev
    \`\`\`
    This command will concurrently start both the backend server (on port 5001) and the frontend development server (on port 5173).

    You can also start them individually:
    \`\`\`bash
    npm run dev:backend
    npm run dev:frontend
    \`\`\`

## 🧪 Testing:

1.  **Access the Frontend**: Open your browser and navigate to `http://localhost:5173`.
2.  **Sign Up**: Create a new account using the sign-up form.
3.  **Sign In**: Log in with your newly created credentials.
4.  **Explore Chat Features**: Send messages, create conversations.
5.  **Test Video Calling**: Initiate a video call (ensure Stream API keys are configured).

## 🛠️ Build & Production:

To build the applications for production:
\`\`\`bash
npm run build:all
\`\`\`
This will compile the TypeScript code in the backend to JavaScript (`backend/dist`) and build the React frontend for production (`frontend/dist`).

To start the backend in production mode:
\`\`\`bash
npm run start:backend
\`\`\`
For the frontend, you would typically serve the `frontend/dist` directory using a static file server or integrate it into your backend server.

## ⚠️ Important Notes:

-   **MongoDB**: Ensure you have a MongoDB instance running or use a cloud-hosted solution like MongoDB Atlas. Update `MONGO_URI` in `backend/.env` accordingly.
-   **Stream API Keys**: For full video calling functionality, you need to obtain API keys from the [Stream Dashboard](https://getstream.io/dashboard/).
-   **Error Handling**: Basic error handling is in place, but for a production application, more robust error logging and handling would be necessary.
# streamify
