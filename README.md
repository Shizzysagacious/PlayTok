# PlayTok 🎮

Welcome to **PlayTok** — the TikTok for mini-games! Scroll through an endless feed of playable games, compete for high scores, and create your own games instantly using AI.

## Features ✨

- **Endless Scrolling Feed:** Swipe up to discover and play new games instantly, just like a video feed.
- **AI Game Generation:** Have an idea for a game? Describe it, and our Gemini AI will build it for you in seconds! (Costs 1000 ₦ tokens).
- **Social Interactions:** Like, comment, and share your favorite games.
- **User Profiles:** Track your token balance, view your created games, and manage your account.
- **Friends & DMs:** Connect with other players and challenge them.
- **Built-in Classics:** Play pre-loaded games like 2048, Tic Tac Toe, Flappy Cube, Aim Trainer, and more.

## Tech Stack 🛠️

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons
- **Backend/Database:** Firebase (Authentication, Firestore)
- **AI Integration:** Google GenAI (Gemini 3.1 Pro) for dynamic game generation
- **Dynamic Rendering:** Custom sandboxed iframe execution for rendering AI-generated React code on the fly.

## Getting Started 🚀

### Prerequisites

- Node.js (v18 or higher)
- A Firebase Project (with Authentication and Firestore enabled)
- A Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Shizzysagacious/PlayTok.git
   cd PlayTok
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY="your_gemini_api_key_here"
   ```

4. **Firebase Configuration:**
   Create a `firebase-applet-config.json` file in the root directory with your Firebase project credentials:
   ```json
   {
     "apiKey": "your_api_key",
     "authDomain": "your_project.firebaseapp.com",
     "projectId": "your_project_id",
     "appId": "your_app_id",
     "firestoreDatabaseId": "(default)"
   }
   ```
   *(Note: This file is ignored by git to protect your credentials).*

5. **Start the development server:**
   ```bash
   npm run dev
   ```

## A Note on Security Alerts (Firebase API Key) 🛡️

If you exported this project to GitHub and received an alert about an exposed "Google API Key" in `firebase-applet-config.json`, **don't panic!**

Firebase Web API keys are designed to be public. They are used to identify your Firebase project to Google's servers, not to grant administrative access. However, to satisfy automated secret scanners and follow best practices, `firebase-applet-config.json` has been added to `.gitignore` so it won't be pushed to your repository in the future.

To fully secure your Firebase project, ensure you have properly configured **Firestore Security Rules** and **App Check** in your Firebase Console.

## License 📄

MIT License
