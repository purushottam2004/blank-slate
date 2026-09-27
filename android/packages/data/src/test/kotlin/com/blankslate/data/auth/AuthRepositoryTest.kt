package com.blankslate.data.auth

import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.test.runTest
import org.junit.Test

class AuthRepositoryTest {
    @Test
    fun signInRejectsBlankEmail() = runTest {
        val remote = FakeAuthRemote()
        val repository = AuthRepository(remote)

        val error = assertFailsWith<IllegalArgumentException> {
            repository.signIn("  ", "password123")
        }

        assertEquals("Email and password are required", error.message)
        assertTrue(remote.signInCalls.isEmpty())
    }

    @Test
    fun signInRejectsBlankPassword() = runTest {
        val remote = FakeAuthRemote()
        val repository = AuthRepository(remote)

        assertFailsWith<IllegalArgumentException> {
            repository.signIn("seed_user@gmail.com", " ")
        }

        assertTrue(remote.signInCalls.isEmpty())
    }

    @Test
    fun signInTrimsEmailAndDelegates() = runTest {
        val remote = FakeAuthRemote()
        val repository = AuthRepository(remote)

        val session = repository.signIn("  seed_user@gmail.com", "password123")

        assertEquals(listOf("seed_user@gmail.com" to "password123"), remote.signInCalls)
        assertEquals("seed_user@gmail.com", session.email)
        assertEquals("token", session.accessToken)
    }

    @Test
    fun signOutDelegates() = runTest {
        val remote = FakeAuthRemote()
        val repository = AuthRepository(remote)

        repository.signOut()

        assertEquals(1, remote.signOutCalls)
    }

    @Test
    fun currentAccessTokenDelegates() {
        val remote = FakeAuthRemote()
        val repository = AuthRepository(remote)

        assertEquals("token", repository.currentAccessToken())
    }
}

private class FakeAuthRemote : AuthRemote {
    val signInCalls = mutableListOf<Pair<String, String>>()
    var signOutCalls = 0

    override fun observe(): Flow<AuthState> = MutableStateFlow(AuthState.SignedOut)

    override fun currentAccessToken(): String = "token"

    override suspend fun signIn(email: String, password: String): AuthSession {
        signInCalls += email to password
        return AuthSession(userId = "user-1", email = email, accessToken = "token")
    }

    override suspend fun signOut() {
        signOutCalls += 1
    }
}
