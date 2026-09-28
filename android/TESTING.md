# Android testing

JVM unit tests and Android lint. No emulator. JDK 17 and Android SDK platform 37.2 are required — see [SETUP_GUIDE.md](./SETUP_GUIDE.md).

## Commands

From `android/`:

```bash
./gradlew test
./gradlew lint
```

Together (quality bar):

```bash
./gradlew test lint
```

`src/androidTest` is not a required check.

## What to add

- Auth or FastAPI client changes → unit tests in `packages/data`.
- Screen state mapping → unit tests next to the feature. Screens must not construct the Supabase client.
- Do not add instrumented tests as a merge requirement.
