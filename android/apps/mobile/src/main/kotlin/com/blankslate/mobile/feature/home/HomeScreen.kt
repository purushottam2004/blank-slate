package com.blankslate.mobile.feature.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.blankslate.data.auth.AuthSession
import com.blankslate.designsystem.BlankError
import com.blankslate.designsystem.Button
import com.blankslate.designsystem.ButtonVariant
import com.blankslate.mobile.R
import kotlinx.coroutines.launch

@Composable
fun HomeScreen(
    session: AuthSession,
    helloViewModel: HelloViewModel,
    onSignOut: suspend () -> Unit,
) {
    val helloState by helloViewModel.state.collectAsStateWithLifecycle()
    val calling = helloState is HelloUiState.Loading
    val scope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(Modifier.weight(1f)) {
                Text(stringResource(R.string.home_title))
                Text(stringResource(R.string.signed_in_as, session.email ?: session.userId.orEmpty()))
            }
            Button(
                text = stringResource(R.string.sign_out),
                onClick = { scope.launch { onSignOut() } },
                variant = ButtonVariant.Secondary,
            )
        }
        Text(stringResource(R.string.backend_heading))
        Text(stringResource(R.string.hello_body))
        Button(
            text = stringResource(if (calling) R.string.calling else R.string.hello),
            onClick = helloViewModel::hello,
            enabled = !calling,
        )
        when (val state = helloState) {
            HelloUiState.Idle, HelloUiState.Loading -> Unit
            is HelloUiState.Error -> Text(state.message, color = BlankError)
            is HelloUiState.Success -> Text(
                text = buildString {
                    appendLine("message: ${state.response.message}")
                    appendLine("authenticated: ${state.response.authenticated}")
                    appendLine("user.id: ${state.response.user.id}")
                    append("user.email: ${state.response.user.email}")
                },
                fontFamily = FontFamily.Monospace,
            )
        }
    }
}
