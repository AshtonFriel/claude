package com.satoshi.cryptoticker.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = Bitcoin,
    onPrimary = DarkBackground,
    primaryContainer = BitcoinDark,
    background = DarkBackground,
    surface = DarkSurface,
    surfaceVariant = DarkSurfaceVariant,
    onBackground = DarkOnSurface,
    onSurface = DarkOnSurface,
    onSurfaceVariant = DarkMuted,
    outline = DarkBorder
)

private val LightColorScheme = lightColorScheme(
    primary = Bitcoin,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFFFF3E0),
    background = LightBackground,
    surface = LightSurface,
    onBackground = Color(0xFF1F2328),
    onSurface = Color(0xFF1F2328),
    outline = LightBorder
)

@Composable
fun CryptoTickerTheme(darkTheme: Boolean = isSystemInDarkTheme(), content: @Composable () -> Unit) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }
    MaterialTheme(colorScheme = colorScheme, typography = Typography, content = content)
}
