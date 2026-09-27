package com.blankslate.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.blankslate.designsystem.BlankSlateTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val container = AppContainer.fromBuildConfig()
        setContent {
            BlankSlateTheme {
                BlankSlateApp(container)
            }
        }
    }
}
