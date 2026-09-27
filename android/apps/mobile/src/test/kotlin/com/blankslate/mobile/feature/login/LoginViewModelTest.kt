package com.blankslate.mobile.feature.login

import com.blankslate.data.auth.AuthRepository
import com.blankslate.data.auth.AuthRemote
import com.blankslate.data.auth.AuthSession
import com.blankslate.data.auth.AuthState
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class LoginViewModelTest {
    @Before
    fun setUp() {
        Dispatchers.setMain(UnconfinedTestDispatcher())
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun signInReturnsToIdle() = runTest {
        val viewModel = LoginViewModel(AuthRepository(FakeAuthRemote()))

        viewModel.signIn("seed_user@gmail.com", "password123")

        assertEquals(LoginUiState.Idle, viewModel.state.value)
    }

    @Test
    fun signInSurfacesError() = runTest {
        val viewModel = LoginViewModel(AuthRepository(FakeAuthRemote(fail = true)))

        viewModel.signIn("seed_user@gmail.com", "password123")

        val state = assertIs<LoginUiState.Error>(viewModel.state.value)
        assertEquals("invalid credentials", state.message)
    }
}

private class FakeAuthRemote(private val fail: Boolean = false) : AuthRemote {
    override fun observe(): Flow<AuthState> = MutableStateFlow(AuthState.SignedOut)

    override fun currentAccessToken(): String? = null

    override suspend fun signIn(email: String, password: String): AuthSession {
        if (fail) throw IllegalArgumentException("invalid credentials")
        return AuthSession(userId = "user-1", email = email, accessToken = "token")
    }

    override suspend fun signOut() = Unit
}
