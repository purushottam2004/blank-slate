package com.blankslate.mobile.feature.login

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.blankslate.data.auth.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class LoginViewModel(
    private val authRepository: AuthRepository,
) : ViewModel() {
    private val _state = MutableStateFlow<LoginUiState>(LoginUiState.Idle)
    val state: StateFlow<LoginUiState> = _state.asStateFlow()

    fun signIn(email: String, password: String) {
        viewModelScope.launch {
            _state.value = LoginUiState.Loading
            try {
                authRepository.signIn(email, password)
                _state.value = LoginUiState.Idle
            } catch (error: Exception) {
                _state.value = LoginUiState.Error(error.message ?: "Sign-in failed")
            }
        }
    }
}
