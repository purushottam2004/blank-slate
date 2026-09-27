package com.blankslate.mobile.feature.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.blankslate.data.auth.AuthRepository
import com.blankslate.data.network.BackendApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class HelloViewModel(
    private val authRepository: AuthRepository,
    private val backendClient: BackendApi,
) : ViewModel() {
    private val _state = MutableStateFlow<HelloUiState>(HelloUiState.Idle)
    val state: StateFlow<HelloUiState> = _state.asStateFlow()

    fun hello() {
        viewModelScope.launch {
            _state.value = HelloUiState.Loading
            try {
                val token = authRepository.currentAccessToken()
                    ?: throw IllegalStateException("Not authenticated")
                _state.value = HelloUiState.Success(backendClient.hello(token))
            } catch (error: Exception) {
                _state.value = HelloUiState.Error(error.message ?: "Request failed")
            }
        }
    }
}
