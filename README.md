# VibeCast App

## Welcome to VibeCast!

VibeCast is a delightful and intuitive weather application designed to not only provide you with up-to-the-minute weather updates but also to match your day's vibe with the current weather conditions. Whether it's a sunny day perfect for a picnic or a cozy rainy evening ideal for reading, VibeCast has suggestions for you.

![VibeCast Home View](weather-home-view.png)

Built with modern technologies, including Vue.js for a dynamic and responsive user interface, Node.js and Express.js for robust server-side operations, and MongoDB for efficient data storage, VibeCast is crafted to offer an engaging user experience.

### Experience VibeCast Live! :sparkles:
Dive into the VibeCast experience and see how the weather aligns with your vibe today! Check out the live site [here](https://vibecast.onrender.com/).

### Key Features:

- **Real-Time Weather Updates:** Get accurate and current weather information for your location.
- **VibeSync:** Unique feature that suggests activities based on the current weather conditions.
- **User Accounts:** Easy sign-up and sign-in process to personalize your experience.
- **Responsive Design:** Whether you're on a phone, tablet, or desktop, VibeCast looks great on any device.

### Getting Started:

Follow these simple steps to get VibeCast running on your local machine:

#### 1. Clone the Repository:
- Open your terminal.
- Navigate to the directory where you want to clone the project.
- Run `git clone <repository-url>`. Replace `<repository-url>` with the actual URL of the VibeCast repository.

#### 2. Set Up the Backend:
- Navigate to the backend directory: `cd backend`
- Install dependencies: `npm install`
- Create a `.env` file in the backend root directory. This file should include the following:
  - `MONGO_URI`: Your MongoDB connection string. For example: 
    ```
    MONGO_URI=mongodb+srv://username:password@cluster0.url.mongodb.net/mydatabase
    ```
  - `VITE_API_URL`: The URL where your backend server will be running, which the frontend will use to connect to the backend. For example, if your backend server is running on port 3000:
    ```
    VITE_API_URL=http://localhost:3000
    ```
- Start the server: `node server.js`

> **Note**: Replace `username`, `password`, `cluster0.url.mongodb.net`, and `mydatabase` in the `MONGO_URI` with your actual MongoDB credentials and database path. The `VITE_API_URL` should match the local or deployed server URL where your backend is accessible.

#### 3. Set Up the Frontend:
- Open a new terminal tab or window.
- Navigate to the frontend directory: `cd frontend`
- Install dependencies: `npm install`
- Create a `.env` file in the frontend root directory. This file should include the following:
  - `VITE_API_KEY`: Your API key for WeatherAPI.com.
  - `VITE_IPAPI_API_KEY`: Your API key for ipapi API to automate IP address validation and geolocation lookup.
  - `VITE_API_URL=http://localhost:3000`: The URL where your backend server is running. Ensure this matches the address and port of your running backend server.
- Start the Vue.js application: `npm run dev`
- Your default web browser should open automatically with the VibeCast app running.

#### 4. Sign Up/Sign In:
- Use the sign-up page to create a new user account.
- If you already have an account, click on the sign-in page to access your personalized VibeCast dashboard.

#### 5. Enjoy VibeCast:
- Explore the app, check the weather, and get personalized activity suggestions with the "VibeSync" feature.
