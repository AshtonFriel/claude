package com.satoshi.cryptoticker

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class CryptoTickerApp : Application() {
    override fun onCreate() {
        super.onCreate()
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        val manager = getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(
            NotificationChannel(
                CHANNEL_PRICE_ALERTS,
                "Price Alerts",
                NotificationManager.IMPORTANCE_HIGH
            ).apply { description = "Notifications for price alert triggers" }
        )
    }

    companion object {
        const val CHANNEL_PRICE_ALERTS = "price_alerts"
    }
}
