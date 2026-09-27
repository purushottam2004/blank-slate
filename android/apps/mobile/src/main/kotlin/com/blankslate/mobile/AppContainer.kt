package com.blankslate.mobile

import com.blankslate.data.auth.AuthRepository
import com.blankslate.data.createAuthRepository
import com.blankslate.data.createBackendClient
import com.blankslate.data.network.BackendClient

class AppContainer(
    val authRepository: AuthRepository,
    val backendClient: BackendClient,
) {
    companion object {
        fun fromBuildConfig(): AppContainer {
            val supabaseUrl = BuildConfig.SUPABASE_URL
            val publishableKey = BuildConfig.SUPABASE_PUBLISHABLE_KEY
            val backendUrl = BuildConfig.BACKEND_URL
            require(supabaseUrl.isNotBlank() && publishableKey.isNotBlank()) {
                "Missing Supabase config. Copy android/.env.example to android/.env and set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY."
            }
            require(backendUrl.isNotBlank()) {
                "Missing BACKEND_URL. Set it in android/.env."
            }
            return AppContainer(
                authRepository = createAuthRepository(supabaseUrl, publishableKey),
                backendClient = createBackendClient(backendUrl),
            )
        }
    }
}
