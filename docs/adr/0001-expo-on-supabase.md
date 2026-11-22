# Expo on Supabase

The product client is the Expo app (Android, iOS, and Expo web while we build). Data lives in Supabase, and any logic the client must not be trusted to enforce is a Postgres function called through Supabase RPC. The template's FastAPI service is not part of this product.

## Considered options

- **FastAPI for domain logic.** Rejected. A second server would duplicate what Supabase already does for this app, and the client would have two backends to keep in step.

## Consequences

- Who can see a profile, a log, or a post has to be enforced in the database (row-level security and RPC), because the app on the phone can be modified.
- The Vite frontend and the Kotlin app stay in the repo as template leftovers. This product does not add screens to them.
