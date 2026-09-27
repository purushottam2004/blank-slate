# Android setup

Repo-wide order: [../SETUP_GUIDE.md](../SETUP_GUIDE.md). The phone app calls the same Supabase project and FastAPI server as the web app. Start those first.

## Prerequisites

Install these on the machine that will compile the app. Android Studio and the emulator are not required. Unit tests run on the JVM.

| Tool | Pin |
| --- | --- |
| JDK | 17 (`openjdk-17-jdk` on Ubuntu) |
| Android SDK platform | `platforms;android-37.2` |
| Android SDK build-tools | `build-tools;36.0.0` |
| Android SDK platform-tools | `platform-tools` |

On Ubuntu, JDK comes from apt. The SDK packages come from Google's `sdkmanager`, not from apt and not from Homebrew.

```bash
sudo apt update
sudo apt install -y openjdk-17-jdk unzip wget

export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export ANDROID_HOME=$HOME/android-sdk

mkdir -p "$ANDROID_HOME/cmdline-tools"
wget -q https://dl.google.com/android/repository/commandlinetools-linux-16111833_latest.zip -O /tmp/commandlinetools.zip
unzip -q /tmp/commandlinetools.zip -d "$ANDROID_HOME/cmdline-tools"
mv "$ANDROID_HOME/cmdline-tools/cmdline-tools" "$ANDROID_HOME/cmdline-tools/latest"

yes | "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --sdk_root="$ANDROID_HOME" --licenses
"$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --sdk_root="$ANDROID_HOME" \
  "platform-tools" \
  "platforms;android-37.2" \
  "build-tools;36.0.0"
```

The `mv` step is required. The zip unpacks a folder named `cmdline-tools`, and `sdkmanager` only works after that folder is renamed to `latest`.

Add the same variables to `~/.zshrc` (or `~/.bashrc`) so new shells can find Java and the SDK:

```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export ANDROID_HOME=$HOME/android-sdk
export PATH=$PATH:$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools
```

Check:

```bash
java -version
sdkmanager --list_installed
```

`sdkmanager` prints a deprecation warning and still installs the packages. The list should include `platforms;android-37.2` and `build-tools;36.0.0`.

## App configuration

```bash
cd android
cp .env.example .env
```

Set `SUPABASE_PUBLISHABLE_KEY` from `supabase/.env`. Keep the service-role key out of this file.

`SUPABASE_URL` and `BACKEND_URL` are baked into the APK at build time.

| Where the app runs | Host address |
| --- | --- |
| Emulator | `10.0.2.2` (the emulator's name for the computer) |
| Physical phone on the same network | The computer's LAN address |
| Unit tests | No network. `.env` is not read |

Local Supabase and FastAPI are `http://`, so the debug manifest allows cleartext traffic. A production HTTPS API does not need that flag.

## Commands

From `android/`:

```bash
./gradlew test
./gradlew lint
./gradlew assembleDebug
```

`test` runs JVM unit tests. It does not start an emulator.

The installable file is:

```text
apps/mobile/build/outputs/apk/debug/mobile-debug.apk
```

Copy that file to an Android phone and open it to install. The first install asks the phone to allow apps from that source.

## Verify: login → Hello

With Supabase and the backend running, and `.env` pointing at them:

1. Install the debug APK.
2. Sign in with a seeded user (`seed_user@gmail.com` / `password123`, or `test@example.com` / `password123`).
3. Tap **Hello**.
4. The screen shows `message: hello`, `authenticated: true`, and the signed-in email.
