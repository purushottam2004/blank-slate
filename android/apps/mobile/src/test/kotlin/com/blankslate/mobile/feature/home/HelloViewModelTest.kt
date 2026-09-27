package com.blankslate.mobile.feature.home

import com.blankslate.data.auth.AuthRepository
import com.blankslate.data.auth.AuthRemote
import com.blankslate.data.auth.AuthSession
import com.blankslate.data.auth.AuthState
import com.blankslate.data.network.BackendApi
import com.blankslate.data.network.HelloResponse
import com.blankslate.data.network.HelloUser
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
class HelloViewModelTest {
    @Before
    fun setUp() {
        Dispatchers.setMain(UnconfinedTestDispatcher())
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun helloStoresResponse() = runTest {
        val viewModel = HelloViewModel(
            authRepository = AuthRepository(FakeAuthRemote(token = "token")),
            backendClient = FakeBackend(),
        )

        viewModel.hello()

        val state = assertIs<HelloUiState.Success>(viewModel.state.value)
        assertEquals("hello", state.response.message)
        assertEquals("seed_user@gmail.com", state.response.user.email)
    }

    @Test
    fun helloWithoutSessionIsAnError() = runTest {
        val viewModel = HelloViewModel(
            authRepository = AuthRepository(FakeAuthRemote(token = null)),
            backendClient = FakeBackend(),
        )

        viewModel.hello()

        val state = assertIs<HelloUiState.Error>(viewModel.state.value)
        assertEquals("Not authenticated", state.message)
    }
}

private class FakeBackend : BackendApi {
    override suspend fun hello(accessToken: String): HelloResponse = HelloResponse(
        message = "hello",
        authenticated = true,
        user = HelloUser(id = "user-1", email = "seed_user@gmail.com"),
    )
}

private class FakeAuthRemote(private val token: String?) : AuthRemote {
    override fun observe(): Flow<AuthState> = MutableStateFlow(AuthState.SignedOut)

    override fun currentAccessToken(): String? = token

    override suspend fun signIn(email: String, password: String): AuthSession {
        error("not used")
    }

    override suspend fun signOut() = Unit
}
