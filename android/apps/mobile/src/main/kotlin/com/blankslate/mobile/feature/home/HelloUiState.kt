package com.blankslate.mobile.feature.home

import com.blankslate.data.network.HelloResponse

sealed interface HelloUiState {
    data object Idle : HelloUiState

    data object Loading : HelloUiState

    data class Success(val response: HelloResponse) : HelloUiState

    data class Error(val message: String) : HelloUiState
}
