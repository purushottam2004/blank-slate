# Android

Kotlin and Jetpack Compose app that signs in with Supabase and calls the FastAPI `GET /api/v1/hello` route. It sits next to `backend/`, `frontend/`, `supabase/`, and `e2e/` because Gradle is its own toolchain.

## Modules

| Module | Role | Web counterpart |
| --- | --- | --- |
| `apps/mobile` | The installed app: activity, navigation, login and home screens | `frontend/apps/web` |
| `packages/data` | Supabase session and the FastAPI client | `frontend/packages/auth` and `backendClient.ts` |
| `packages/designsystem` | Theme and shared button | `frontend/packages/ui` |

`packages/data` and `packages/designsystem` do not depend on the app or on each other. Screens do not call HTTP. They ask `AuthRepository` and `BackendApi`.

## Toolchain

Pinned in [`gradle/libs.versions.toml`](./gradle/libs.versions.toml):

| Piece | Version | Why |
| --- | --- | --- |
| JDK | 17 | Android Gradle Plugin 9.4 lists 17 as its minimum and its default |
| Android Gradle Plugin | 9.4.1 | Latest stable. 9.5 is still alpha |
| Gradle | 9.6.0 | Required by AGP 9.4 |
| Kotlin | 2.4.20 | Latest stable, via AGP's built-in Kotlin. supabase-kt 3.8.0 is compiled with Kotlin 2.4. AGP's default is 2.2.10, so the root build file raises it |
| Compose BOM | 2026.09.00 | Current Compose bill of materials |
| supabase-kt | 3.8.0 | Auth client. Same project as the web app |
| compileSdk | 37.2 | Latest stable platform. Compose BOM 2026.09 requires compileSdk 37 or newer. targetSdk stays 36 |
| build-tools | 36.0.0 | AGP 9.4's default |

Setup: [SETUP_GUIDE.md](./SETUP_GUIDE.md). Contribution rules: [CONTRIBUTING.md](./CONTRIBUTING.md).
