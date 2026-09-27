package com.blankslate.mobile.feature.login

sealed interface LoginUiState {
    data object Idle : LoginUiState

    data object Loading : LoginUiState

    data class Error(val message: String) : LoginUiState
}
