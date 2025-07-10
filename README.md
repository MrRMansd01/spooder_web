# Spooder Web - Chat Application

This project is a full-stack web chat application built with React for the client and Node.js/Express for the server. It allows users to register, log in, join chat rooms, and communicate with others.

## ✨ Features

- **User Authentication:** Secure user registration and login.
- **Chat Rooms:** Create and join different chat rooms.
- **Real-time Chat:** Send and receive messages instantly.
- **Responsive UI:** Designed to work on various devices.
- **Profile Management:** View and edit user profile information.

## 🛠️ Technologies Used

### Client-Side
- **React:** A powerful library for building user interfaces.
- **React Router:** for handling routing and navigation within the application.
- **Supabase Client:** To connect to the Supabase service for authentication.
- **Axios:** For making HTTP requests to the server.
- **CSS:** For styling components.

### Server-Side
- **Node.js:** A JavaScript runtime for the server.
- **Express:** A web framework for building APIs.
- **Supabase Client:** To interact with the Supabase database and services.
- **CORS:** For managing cross-origin resource sharing.

## ⚙️ Prerequisites

Before you begin, ensure you have the following software installed:
- [Node.js](https://nodejs.org/) (version 14 or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

You will also need a **Supabase** project for database management and authentication.

## 🚀 Setup and Installation

1.  **Clone the project:**
    ```bash
    git clone https://github.com/MrRMansd01/spooder_web.git
    cd spooder_web
    ```

2.  **Install server dependencies:**
    ```bash
    cd server
    npm install
    ```

3.  **Install client dependencies:**
    ```bash
    cd ../client
    npm install
    ```

4.  **Configure Supabase:**
    - Create a `.env` file in both the `server` and `client` directories.
    - Add your Supabase project credentials to these files:
      ```
      SUPABASE_URL=your_supabase_url
      SUPABASE_KEY=your_supabase_anon_key
      ```
    - You will need to use these variables in the `supabaseClient.js` files in both the client and server.

## ▶️ Usage

To run the project, you need to run the server and client simultaneously.

1.  **Run the server:**
    - In a terminal, navigate to the `server` directory and run the following command:
    ```bash
    npm start
    ```
    The server will run on port `3001`.

2.  **Run the client:**
    - In another terminal, navigate to the `client` directory and run the following command:
    ```bash
    npm start
    ```
    The React application will run on port `3000` and open in your browser.

## 📂 Project Structure

```
spooder_web/
├── client/         # Frontend code (React)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── index.js
│   └── package.json
│
├── server/         # Backend code (Node.js/Express)
│   ├── routes/     # API routes
│   ├── server.js   # Main server file
│   └── package.json
│
└── README.md
