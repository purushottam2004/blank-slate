package com.blankslate.designsystem

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val BlankPrimary = Color(0xFF646CFF)
val BlankError = Color(0xFFE5484D)

private val ColorScheme = lightColorScheme(
    primary = BlankPrimary,
    onPrimary = Color.White,
    error = BlankError,
)

@Composable
fun BlankSlateTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = ColorScheme,
        content = content,
    )
}
