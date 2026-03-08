# Abbey Connect Full-Stack Challenge

A professional networking platform built as part of the Abbey Mortgage Bank full-stack challenge.

## Features
- Secure authentication (register, login, logout, token refresh)
- User profiles (view & edit name, bio)
- User discovery with search and pagination
- Follow / unfollow system
- Public profile pages
- Clean, modular architecture with separated UI and business logic

## Tech Stack

### Backend
- Node.js + Express
- Prisma ORM + PostgreSQL
- JWT authentication with refresh tokens
- REST API with proper error handling and validation

### Frontend
- React (Create React App)
- Ant Design (UI components)
- SCSS (styling)
- Axios (API client)
- React Router (navigation)

## How to Run

### Backend
```bash
cd backend
npm install
npm run dev

Runs on http://localhost:4000 (or your configured port)


## Frontend
cd frontend
npm install
npm start
Runs on http://localhost:3000

## Mobile App (Expo)
cd mobile
npm install
npx expo start --clear

Press a → open in Android emulator/device
Press i → open in iOS simulator
Or scan the QR code with Expo Go app on your phone (recommended)


abbey-fullstack-akanni/
├── backend/          # Node.js + Express + Prisma
│   ├── src/
│   └── package.json
├── frontend/         # React + Ant Design + SCSS
│   ├── src/
│   └── package.json
├── mobile/                     # React Native + Expo mobile app
│   ├── app/                    # Expo Router routes
│   ├── src/                    # services, components, etc.
│   ├── app.json
│   └── package.json
|_
|
└── README.md

