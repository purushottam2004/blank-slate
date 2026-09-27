package com.blankslate.data.network

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.http.HttpHeaders

interface BackendApi {
    suspend fun hello(accessToken: String): HelloResponse
}

/**
 * Authenticated fetch against the FastAPI backend.
 * Attaches the current Supabase access token as Bearer auth.
 */
class BackendClient(
    private val http: HttpClient,
    private val baseUrl: String,
) : BackendApi {
    override suspend fun hello(accessToken: String): HelloResponse {
        val token = accessToken.trim()
        if (token.isEmpty()) {
            throw IllegalStateException("Not authenticated")
        }
        val root = baseUrl.trimEnd('/')
        return http.get("$root/api/v1/hello") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }.body()
    }
}
