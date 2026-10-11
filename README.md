# TrackOps

TrackOps is an Expo and React Native expense tracking app. It currently includes account registration and login with Firebase Authentication, profile editing, and starter wallet and statistics screens. Wallet balances and transaction tracking are still placeholders in the current app.

## Requirements

- Node.js 20 LTS or newer
- npm
- A Firebase project with Authentication and Cloud Firestore enabled
- For device testing: Expo Go, or Android Studio / Xcode for a simulator

## Set up Firebase

1. Create a project in the [Firebase Console](https://console.firebase.google.com/).
2. Add a **Web app** to the Firebase project and copy its Firebase configuration values.
3. In **Authentication → Sign-in method**, enable **Email/Password**.
4. Create a **Cloud Firestore** database.
5. Configure Firestore rules for authenticated users. A simple development starting point is below; review and tighten rules before production:

   ```text
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

Firebase client configuration is included in the app bundle, so these values are not server secrets. Firestore Security Rules must protect user data. Do not put service account credentials in this app.

## Install and configure

```bash
git clone <repository-url>
cd trackops
npm install
cp .env.example .env
```

Fill `.env` with the values from the Firebase Web app configuration:

```dotenv
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

`EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID` is optional. The app does not currently initialize Firebase Analytics.

## Run the app

Start the Expo development server:

```bash
npm start
```

Then use the terminal menu or Expo Go to open the app. You can also launch a target directly:

```bash
npm run android
npm run ios
npm run web
```

The iOS simulator command requires macOS and Xcode. Android requires an Android emulator/device configured through Android Studio. For a physical device, install Expo Go and scan the QR code shown by Expo; keep the computer and phone on the same network if using the default LAN connection.

## Available scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the Expo development server |
| `npm run android` | Start Expo and open Android |
| `npm run ios` | Start Expo and open the iOS simulator |
| `npm run web` | Start the web version |
| `npm run lint` | Run Expo lint |
| `npm test` | Run Jest in watch mode |

## Project layout

```text
app/                 Expo Router routes (auth, tabs, and modals)
components/          Shared UI components
config/firebase.ts   Firebase app, Authentication, and Firestore setup
contexts/            Authentication context
services/            Image helper services
constants/           Theme constants
assets/              App images and fonts
```

## Troubleshooting

- **Firebase configuration missing:** check that `.env` is in the project root and uses the exact `EXPO_PUBLIC_FIREBASE_...` names above. Restart Expo after changing environment values.
- **Authentication fails:** confirm Email/Password is enabled in Firebase Authentication and that the app is using the correct Firebase project.
- **Firestore permission denied:** check that Firestore exists and its rules allow the signed-in user to access their own `users/{uid}` document.
- **Changes do not appear:** stop the Expo server, then restart with `npx expo start --clear`.

## Development notes

- Routes live under `app/` and use Expo Router's file-based routing.
- Firebase Authentication persists on React Native using AsyncStorage.
- Profile data is stored in the Firestore `users` collection.
- The wallet total is currently hard-coded as a placeholder; transaction persistence and statistics are not implemented yet.
