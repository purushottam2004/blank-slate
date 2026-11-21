# React Native setup

Repo-wide order: [../SETUP_GUIDE.md](../SETUP_GUIDE.md). This app calls the same Supabase project and FastAPI server as the web app and the Kotlin app. Start those first.

Lint, type-check, and the host-rewrite unit test need only Node.js and pnpm. A simulator is for running the UI.

## Prerequisites

| Tool | When you need it | How |
| --- | --- | --- |
| Node.js ≥ 22.13 | Always | `brew install node` if `node -v` is older |
| pnpm 11.17 | Always | Same pin as `frontend/`. This package's `packageManager` field asks for 11.17.0 |
| Xcode 26.4 or newer | iOS simulator | Mac App Store, not Homebrew. Then Xcode → Settings → Locations → Command Line Tools, and Settings → Components → iOS simulator |
| JDK 17 | Android emulator or a native Android build | `brew install --cask zulu@17` if `java -version` is not already 17. Set `JAVA_HOME` to that JDK |
| Android Studio | Android emulator | `brew install --cask android-studio` |

Watchman is not required on Expo SDK 56 or newer. CocoaPods is not required. Expo compiles iOS with the Xcode project it generates.

### Android SDK

Android Studio's default SDK location is `$HOME/Library/Android/sdk`. The Kotlin app's guide installs a command-line SDK at `$HOME/android-sdk`. Use one SDK, and point `ANDROID_HOME` at it. That SDK needs:

- Android SDK Platform 37 (Expo SDK 58 `compileSdkVersion`)
- Android SDK Build-Tools
- Android Emulator, plus one virtual device
- Android SDK Platform-Tools (`adb`)

Add this to `~/.zshrc`, using the path of the SDK you actually have:

```bash
export JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$JAVA_HOME/bin:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
```

If your JDK or SDK lives somewhere else, change those two paths. `adb` should run in a new terminal.

Expo web (`pnpm web`) does not need Xcode or Android Studio.

## App configuration

```bash
cd react-native
pnpm install
cp .env.example .env
```

Set `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from `supabase/.env`. Keep the service-role key out of this file.

| Where the app runs | Host in `.env` |
| --- | --- |
| iOS simulator, Expo web | `127.0.0.1` (the example file) |
| Android emulator | `127.0.0.1` is fine. The app rewrites it to `10.0.2.2` on Android only |
| Physical phone on the same network | This computer's LAN address, in both URL variables |

Local Supabase and FastAPI are `http://`. The app config allows cleartext traffic on Android and local networking on iOS so a development build can reach them. Expo Go uses its own network settings.

## Commands

From `react-native/`:

```bash
pnpm start
pnpm ios
pnpm android
pnpm web
```

`pnpm start` opens Metro. From that terminal, press `i` for the iOS simulator, `a` for the Android emulator, or `w` for the browser. Expo web listens on port **8081**. Vite stays on `5173`. FastAPI stays on `8080`.

## Verify: login → Hello

With Supabase and the backend already running:

1. Start this app and open one target (`i`, `a`, or `w`).
2. Sign in with a seeded user:

   | Email | Password |
   | --- | --- |
   | `seed_user@gmail.com` | `password123` |
   | `test@example.com` | `password123` |

3. On the home screen, press **Hello**.
4. You should see JSON like:

   ```json
   {
     "message": "hello",
     "authenticated": true,
     "user": { "id": "...", "email": "seed_user@gmail.com" }
   }
   ```

If Hello fails with a network error on the Android emulator, confirm the backend is on port `8080` and `DEPLOYMENT_ENV=LOCAL` in `backend/.env`. A physical phone cannot use `127.0.0.1`.
