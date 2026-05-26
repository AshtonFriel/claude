package com.satoshi.cryptoticker

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.satoshi.cryptoticker.ui.navigation.NavGraph
import com.satoshi.cryptoticker.ui.theme.CryptoTickerTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            CryptoTickerTheme {
                NavGraph()
            }
        }
    }
}
