package com.blankslate.data.network

import io.ktor.client.HttpClient
import io.ktor.client.engine.mock.MockEngine
import io.ktor.client.engine.mock.respond
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.headersOf
import io.ktor.serialization.kotlinx.json.json
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue
import kotlinx.coroutines.test.runTest
import kotlinx.serialization.json.Json
import org.junit.Test

class BackendClientTest {
    @Test
    fun helloRejectsBlankToken() = runTest {
        val client = BackendClient(http = unusedHttp(), baseUrl = "http://10.0.2.2:8080")

        val error = assertFailsWith<IllegalStateException> {
            client.hello("  ")
        }

        assertEquals("Not authenticated", error.message)
    }

    @Test
    fun helloSendsBearerTokenAndParsesBody() = runTest {
        var capturedAuth: String? = null
        var capturedUrl: String? = null
        val engine = MockEngine { request ->
            capturedAuth = request.headers[HttpHeaders.Authorization]
            capturedUrl = request.url.toString()
            respond(
                content = """
                    {"message":"hello","authenticated":true,"user":{"id":"user-1","email":"seed_user@gmail.com"}}
                """.trimIndent(),
                status = HttpStatusCode.OK,
                headers = headersOf(HttpHeaders.ContentType, "application/json"),
            )
        }
        val client = BackendClient(
            http = jsonClient(engine),
            baseUrl = "http://10.0.2.2:8080/",
        )

        val response = client.hello("access-token")

        assertEquals("Bearer access-token", capturedAuth)
        assertEquals("http://10.0.2.2:8080/api/v1/hello", capturedUrl)
        assertEquals("hello", response.message)
        assertTrue(response.authenticated)
        assertEquals("user-1", response.user.id)
        assertEquals("seed_user@gmail.com", response.user.email)
    }
}

private fun unusedHttp(): HttpClient = HttpClient(MockEngine { error("request should not be sent") })

private fun jsonClient(engine: MockEngine): HttpClient = HttpClient(engine) {
    install(ContentNegotiation) {
        json(Json { ignoreUnknownKeys = true })
    }
    expectSuccess = true
}
