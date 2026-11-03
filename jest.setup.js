process.env.EXPO_PUBLIC_FIREBASE_API_KEY =
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "mock-api-key";
process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN =
  process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock.firebaseapp.com";
process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID =
  process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "mock-project";
process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET =
  process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "mock-storage";
process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID =
  process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789";
process.env.EXPO_PUBLIC_FIREBASE_APP_ID =
  process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "mock-app-id";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);
