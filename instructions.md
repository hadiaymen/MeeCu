# MeeCu Deployment Instructions

This guide provides step-by-step instructions for deploying the MeeCu web app.

## 1. Backend Deployment (Render)

1.  **Login to Render**: Go to [render.com](https://render.com) and sign in with your GitHub account.
2.  **Create New Web Service**: Click **New +** and select **Web Service**.
3.  **Connect Repository**: Connect your `MeeCu` repository.
4.  **Configure Service**:
    *   **Name**: `meecu-backend` (or similar)
    *   **Root Directory**: `server`
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
5.  **Environment Variables**: Click **Advanced** and add:
    *   `PORT`: `10000`
6.  **Deploy**: Click **Create Web Service**.
7.  **Note the URL**: After deployment, copy the service URL (e.g., `https://meecu.onrender.com`).

---

## 2. Frontend Deployment (Netlify)

1.  **Login to Netlify**: Go to [netlify.com](https://netlify.com) and sign in with GitHub.
2.  **Add New Site**: Click **Add new site** -> **Import an existing project**.
3.  **Connect GitHub**: Select your `MeeCu` repository.
4.  **Build Settings**:
    *   **Base directory**: `client`
    *   **Build command**: `npm run build`
    *   **Publish directory**: `dist`
5.  **Environment Variables**: Click **Site configuration** -> **Environment variables** (or add during setup):
    *   `VITE_BACKEND_URL`: `https://meecu.onrender.com` (Use your actual Render URL).
6.  **Deploy**: Click **Deploy [Site Name]**.

---

## 3. PWA Installation

*   **Android (Chrome)**: Visit your Netlify URL. You should see an **"Install App"** button on the home screen. Click it to install the PWA.
*   **iOS (Safari)**: Visit your Netlify URL. Tap the **Share** icon (square with up arrow) and select **"Add to Home Screen"**.

---

## 4. Updates

Whenever you push changes to your GitHub `main` branch, both Render and Netlify will automatically redeploy your app.
