package com.blankslate.data.auth

import kotlinx.coroutines.flow.Flow

/**
 * Session operations the screens are allowed to call.
 * The Supabase client stays behind [AuthRemote].
 */
class AuthRepository(
    private val remote: AuthRemote,
) {
    fun observe(): Flow<AuthState> = remote.observe()

    fun currentAccessToken(): String? = remote.currentAccessToken()

    suspend fun signIn(email: String, password: String): AuthSession {
        if (email.isBlank() || password.isBlank()) {
            throw IllegalArgumentException("Email and password are required")
        }
        return remote.signIn(email.trim(), password)
    }

    suspend fun signOut() {
        remote.signOut()
    }
}

interface AuthRemote {
    fun observe(): Flow<AuthState>

    fun currentAccessToken(): String?

    suspend fun signIn(email: String, password: String): AuthSession

    suspend fun signOut()
}
