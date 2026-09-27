package com.blankslate.data

import com.blankslate.data.auth.AuthRepository
import com.blankslate.data.auth.SupabaseAuthRemote
import com.blankslate.data.network.BackendClient
import io.github.jan.supabase.auth.Auth
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.createSupabaseClient
import io.ktor.client.HttpClient
import io.ktor.client.engine.okhttp.OkHttp
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json

fun createAuthRepository(supabaseUrl: String, publishableKey: String): AuthRepository {
    val supabase = createSupabaseClient(
        supabaseUrl = supabaseUrl,
        supabaseKey = publishableKey,
    ) {
        install(Auth)
    }
    return AuthRepository(SupabaseAuthRemote(supabase.auth))
}

fun createBackendClient(backendUrl: String): BackendClient {
    val http = HttpClient(OkHttp) {
        install(ContentNegotiation) {
            json(
                Json {
                    ignoreUnknownKeys = true
                },
            )
        }
        expectSuccess = true
    }
    return BackendClient(http, backendUrl)
}
