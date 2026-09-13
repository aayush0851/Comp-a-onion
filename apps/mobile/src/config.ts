// The Android client ID (package + SHA-1 registered in Google Cloud Console) —
// never referenced directly in code; Google Play Services matches it automatically.
// Kept here only as a record of what's registered.
export const GOOGLE_ANDROID_CLIENT_ID = '626424127693-sfvfh244hl34stgdttt990ufsj3a5q2p.apps.googleusercontent.com';

// A "Web application" type OAuth client ID from the same Google Cloud project.
// Required by @react-native-google-signin as the audience for the ID token it returns.
export const GOOGLE_WEB_CLIENT_ID = '626424127693-3jklfon1do1nrgtde8ehjmgd6h3uund0.apps.googleusercontent.com';

// The NestJS API, deployed on Render. In dev, points at the local server
// instead — reachable at localhost:3002 on a USB-connected Android device via
// `adb reverse tcp:3002 tcp:3002` (re-run after reconnecting the device).
export const API_BASE_URL = __DEV__ ? 'http://localhost:3002' : 'https://companion-server-eyec.onrender.com';
