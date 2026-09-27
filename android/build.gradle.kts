buildscript {
    dependencies {
        // AGP 9.4's built-in Kotlin defaults to 2.2.10. supabase-kt 3.8.0 needs 2.4+.
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:${libs.versions.kotlin.get()}")
    }
}

plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.android.library) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.kotlin.serialization) apply false
}
