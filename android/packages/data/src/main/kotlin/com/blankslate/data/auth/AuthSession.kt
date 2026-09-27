package com.blankslate.data.auth

data class AuthSession(
    val userId: String?,
    val email: String?,
    val accessToken: String,
)

sealed interface AuthState {
    data object Loading : AuthState

    data object SignedOut : AuthState

    data class SignedIn(val session: AuthSession) : AuthState
}
