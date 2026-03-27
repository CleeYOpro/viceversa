# KomeKare - 3rd place at Divergent Hackathon

KomeKare is an AI-powered family caregiver coordination mobile app built natively utilizing Expo and Firebase infrastructure linking AI summarizations with Google Gemini 1.5 Flash models.

## Tech Stack
- Expo (React Native)
- Firebase (Auth, Firestore, Realtime DB, Storage)
- Zustand (State Management persistence hook binding AsyncStorage)
- Google Gemini 1.5 Flash (AI Insights API)
- NativeWind (Utility based dynamic Tailwind styling)

## Setup
1. Clone repository to your designated workspace local directory
2. `npm install`
3. Copy `.env.example` to `.env` and register remote variables mapped to API keys
4. `npx expo start` to initialize dev web bundle processes 

## Testing
Run `npm run test` or `npx jest` to execute unit, behavior bindings and fast-check property-based tests verifying internal component logic validity constraints.
