# TrackOps: Manual Setup & Attention Required

This document outlines items that require manual configuration, credentials setup, or physical device testing outside the automated codebase fixes.

---

## 1. ⚠️ CRITICAL: Rotate Exposed Credentials

A local file named `secrets.txt` previously contained plaintext credentials and had been committed to git history:
- **Exposed Email:** `abdulkanton2005@gmail.com`
- **Exposed Password:** `abdulpassword12`

### Immediate Actions Required:
1. **Change the Password:** Sign into Firebase Authentication (or your associated email provider) and update your password immediately.
2. **Git History Scrub (If publishing publicly):** `secrets.txt` has been removed from git tracking (`git rm --cached secrets.txt`) and added to `.gitignore`. However, if this repository is ever pushed to a public GitHub/GitLab remote, use [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) or `git-filter-repo` to purge `secrets.txt` from previous commit history.

---

## 2. Google OAuth 2.0 Client IDs Configuration

The authentication flow supports Google Sign-In via `expo-auth-session`, but Google Client IDs must be obtained from Google Cloud Console / Firebase Console:

### Steps:
1. Go to [Google Cloud Console](https://console.cloud.google.com/) under the project linked to your Firebase project (`trackops-1a1e8`).
2. Navigate to **APIs & Services** > **Credentials**.
3. Create OAuth 2.0 Client IDs:
   - **Web Application:** Copy the client ID.
   - **Android:** Specify your package name (`com.trackops.app` from `app.json`) and your SHA-1 fingerprint (run `npx expo prebuild` or use your debug/release keystore SHA-1).
   - **iOS:** Specify your iOS bundle identifier.
4. Add these IDs to your `.env` file:
   ```env
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
   ```
5. Restart the Expo server (`bun run start --clear`).

---

## 3. Deploy Firestore Security Rules

A complete, production-grade `firestore.rules` file has been generated in the project root. It strictly enforces user data isolation so that each user can only read, write, update, or delete documents under `users/{userId}/*`.

### How to Deploy:
#### Option A: Via Firebase CLI (Recommended)
```bash
# If not installed or logged in:
bun x firebase login

# Deploy rules:
bun x firebase deploy --only firestore:rules
```

#### Option B: Via Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/).
2. Select your project -> **Firestore Database** -> **Rules** tab.
3. Replace the contents with the rules from [`firestore.rules`](./firestore.rules).
4. Click **Publish**.

---

## 4. Multi-Platform Device Testing

Automated unit tests (`bun run test`) verify calculations, formatting, validations, and error handling. However, physical device behaviors must be manually verified:

- **Android:**
  ```bash
  bun run android
  ```
  Check keyboard avoiding behavior on transaction modal, back-button hardware press, and Google Sign-in dialog.
- **iOS:**
  ```bash
  bun run ios
  ```
  Check modal presentation, safe area insets on iPhone notch / Dynamic Island, and keyboard scroll dismiss.
- **Web:**
  ```bash
  bun run web
  ```
  Verify responsive layout and browser persistence.

---

## 5. Release Builds & Production Keystore (Milestone 5)

When preparing to publish to the Google Play Store or Apple App Store:

1. **EAS Build Setup:**
   ```bash
   bun x eas-cli login
   bun x eas-cli build:configure
   ```
2. **Android Keystore:**
   - Configure release keystore credentials or let EAS generate and manage them.
3. **Application Metadata (`app.json`):**
   - Verify `version`, `android.versionCode`, and `ios.buildNumber` before creating new release builds.
   - Ensure production privacy policy URL is added to `Profile` screen.
