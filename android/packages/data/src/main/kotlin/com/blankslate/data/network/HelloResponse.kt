package com.blankslate.data.network

import kotlinx.serialization.Serializable

@Serializable
data class HelloUser(
    val id: String? = null,
    val email: String? = null,
)

@Serializable
data class HelloResponse(
    val message: String,
    val authenticated: Boolean,
    val user: HelloUser,
)
