package com.blankslate.mobile

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.blankslate.data.auth.AuthState
import com.blankslate.mobile.feature.home.HelloViewModel
import com.blankslate.mobile.feature.home.HomeScreen
import com.blankslate.mobile.feature.login.LoginScreen
import com.blankslate.mobile.feature.login.LoginViewModel

@Composable
fun BlankSlateApp(container: AppContainer) {
    val authState by container.authRepository.observe().collectAsStateWithLifecycle(
        initialValue = AuthState.Loading,
    )

    when (val state = authState) {
        AuthState.Loading -> {
            Box(Modifier.fillMaxSize().padding(32.dp)) {
                Text(stringResource(R.string.loading))
            }
        }

        AuthState.SignedOut -> {
            val loginViewModel = viewModel { LoginViewModel(container.authRepository) }
            LoginScreen(loginViewModel)
        }

        is AuthState.SignedIn -> {
            val helloViewModel = viewModel { HelloViewModel(container.authRepository, container.backendClient) }
            HomeScreen(
                session = state.session,
                helloViewModel = helloViewModel,
                onSignOut = container.authRepository::signOut,
            )
        }
    }
}
