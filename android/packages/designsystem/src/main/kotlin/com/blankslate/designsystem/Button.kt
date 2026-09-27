package com.blankslate.designsystem

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.material3.Button as MaterialButton
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

enum class ButtonVariant {
    Primary,
    Secondary,
}

@Composable
fun Button(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    variant: ButtonVariant = ButtonVariant.Primary,
    enabled: Boolean = true,
) {
    val colors = when (variant) {
        ButtonVariant.Primary -> ButtonDefaults.buttonColors(
            containerColor = BlankPrimary,
            contentColor = Color.White,
            disabledContainerColor = BlankPrimary.copy(alpha = 0.6f),
            disabledContentColor = Color.White,
        )
        ButtonVariant.Secondary -> ButtonDefaults.buttonColors(
            containerColor = Color.Transparent,
            contentColor = BlankPrimary,
            disabledContainerColor = Color.Transparent,
            disabledContentColor = BlankPrimary.copy(alpha = 0.6f),
        )
    }
    val border = if (variant == ButtonVariant.Secondary) {
        BorderStroke(1.dp, BlankPrimary)
    } else {
        null
    }
    MaterialButton(
        onClick = onClick,
        modifier = modifier.defaultMinSize(minHeight = 40.dp),
        enabled = enabled,
        shape = androidx.compose.foundation.shape.RoundedCornerShape(8.dp),
        colors = colors,
        border = border,
        contentPadding = PaddingValues(horizontal = 18.dp, vertical = 10.dp),
    ) {
        Text(text)
    }
}
