#  St. Barnabas Amazing Voices Choir - Cloud Storage App

A comprehensive, standalone cloud storage and management web application for choir members. It features role-based access control, music file management, debt tracking, voice notes, and audit logging.

This application runs entirely in the browser using `localStorage` for data persistence, meaning **no backend server or database setup is required**.

✨ Features

- 4 User Roles: President (Admin), Custodian, Secretary, and User.
- Music Library: Upload, categorize, search, download, and play audio/PDF files.
- Debt Tracker: Track member dues, record payments, and export to CSV.
- Minutes & Receipts: Secretary can upload meeting minutes and member receipts.
- Voice Notes: Record and playback audio notes directly in the browser.
- Audit Logs: Track all system activities for security and accountability (President only).
- Responsive Design: Fully mobile-friendly with a hamburger menu for smaller screens.
- Multi-Currency: Toggle between Turkish Lira (₺) and US Dollar ($).

Prerequisites

Before you begin, ensure you have the following installed on your computer:
-Node.js (Version 16 or higher recommended) - [Download here](https://nodejs.org/)
-npm (Comes with Node.js)

##  Installation Instructions

Open your terminal (PowerShell, Command Prompt, or VS Code Terminal) and follow these steps:

### Step 1: Navigate to the project folder
```bash
cd choir-cloud-app

Step 2: Install base dependencies
npm install

Step 3: Install Tailwind CSS (Crucial Step)
npm install -D tailwindcss@3.4.1 postcss@8.4.35 autoprefixer@10.4.18

Step 4: Initialize Tailwind Configuration
npx tailwindcss init -p

🚀 Launching the App
npm run dev


🔑 Demo Accounts Logins

            <p>👑 president@choir.org / admin123</p>
            <p>🎵 custodian@choir.org / cust123</p>
            <p>📝 secretary@choir.org / sec123</p>
            <p>👤 member@choir.org / user123</p>


🐛 Troubleshooting
If you run into issues, here are the most common fixes:
1. "Unknown at rule @tailwind" or PostCSS errors:
Ensure you installed Tailwind v3 (Step 3 above). If you accidentally installed v4, run:
npm uninstall tailwindcss
npm install -D tailwindcss@3.4.1


2. "Cannot find module" or TypeScript errors in VS Code:
VS Code's TypeScript server sometimes gets stuck.
Press Ctrl + Shift + P (or Cmd + Shift + P on Mac).
Type TypeScript: Restart TS Server and press Enter.
3. Port 3000/5173 is already in use:
Vite will automatically try the next available port (e.g., 3001, 5174). Just use the URL provided in your terminal.
