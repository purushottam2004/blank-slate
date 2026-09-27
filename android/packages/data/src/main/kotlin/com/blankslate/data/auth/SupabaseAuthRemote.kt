package com.blankslate.data.auth

import io.github.jan.supabase.auth.Auth
import io.github.jan.supabase.auth.providers.builtin.Email
import io.github.jan.supabase.auth.status.SessionStatus
import io.github.jan.supabase.auth.user.UserSession
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class SupabaseAuthRemote(
    private val auth: Auth,
) : AuthRemote {
    override fun observe(): Flow<AuthState> = auth.sessionStatus.map { status ->
        when (status) {
            is SessionStatus.Authenticated -> AuthState.SignedIn(status.session.toAuthSession())
            SessionStatus.Initializing -> AuthState.Loading
            is SessionStatus.NotAuthenticated -> AuthState.SignedOut
            is SessionStatus.RefreshFailure -> AuthState.SignedOut
        }
    }

    override fun currentAccessToken(): String? = auth.currentAccessTokenOrNull()

    override suspend fun signIn(email: String, password: String): AuthSession {
        auth.signInWith(Email) {
            this.email = email
            this.password = password
        }
        val session = auth.currentSessionOrNull() ?: error("Sign-in did not produce a session")
        return session.toAuthSession()
    }

    override suspend fun signOut() {
        auth.signOut()
    }
}

private fun UserSession.toAuthSession(): AuthSession = AuthSession(
    userId = user?.id,
    email = user?.email,
    accessToken = accessToken,
)
