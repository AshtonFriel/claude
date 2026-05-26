package com.satoshi.cryptoticker.widget

import androidx.glance.appwidget.GlanceAppWidgetReceiver
import com.satoshi.cryptoticker.data.api.CoinGeckoApi
import dagger.hilt.EntryPoint
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

class CryptoWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget = CryptoWidget()
}

@EntryPoint
@InstallIn(SingletonComponent::class)
interface WidgetEntryPoint {
    fun coinGeckoApi(): CoinGeckoApi
}
