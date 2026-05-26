package com.satoshi.cryptoticker.widget

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.appWidgetBackground
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.*
import androidx.glance.text.*
import androidx.glance.unit.ColorProvider
import com.satoshi.cryptoticker.data.api.CoinGeckoApi
import dagger.hilt.android.EntryPointAccessors
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class CryptoWidget : GlanceAppWidget() {

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val prices = withContext(Dispatchers.IO) {
            runCatching {
                val entryPoint = EntryPointAccessors.fromApplication(
                    context.applicationContext,
                    WidgetEntryPoint::class.java
                )
                entryPoint.coinGeckoApi()
                    .getMarkets(ids = "bitcoin,ethereum", sparkline = false)
            }.getOrNull()
        }

        provideContent {
            WidgetContent(
                prices?.associate { it.id to (it.currentPrice to (it.priceChangePercentage24h ?: 0.0)) }
                    ?: emptyMap()
            )
        }
    }
}

@Composable
private fun WidgetContent(prices: Map<String, Pair<Double, Double>>) {
    Column(
        modifier = GlanceModifier
            .fillMaxSize()
            .padding(12.dp)
            .appWidgetBackground()
            .background(Color(0xFF161B22)),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            "Crypto",
            style = TextStyle(color = ColorProvider(Color(0xFF8B949E)), fontSize = 11.sp)
        )
        Spacer(GlanceModifier.height(6.dp))
        prices.forEach { (coinId, pricePair) ->
            val (price, change) = pricePair
            val label = if (coinId == "bitcoin") "BTC" else "ETH"
            val changeColor = if (change >= 0) Color(0xFF00C853) else Color(0xFFFF1744)
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    "$label: $${"%.0f".format(price)}",
                    style = TextStyle(
                        color = ColorProvider(Color.White),
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    ),
                    modifier = GlanceModifier.defaultWeight()
                )
                Text(
                    "${if (change >= 0) "+" else ""}${"%.1f".format(change)}%",
                    style = TextStyle(color = ColorProvider(changeColor), fontSize = 12.sp)
                )
            }
            Spacer(GlanceModifier.height(4.dp))
        }
    }
}
