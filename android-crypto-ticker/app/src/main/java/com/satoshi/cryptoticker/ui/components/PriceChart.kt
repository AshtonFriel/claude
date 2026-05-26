package com.satoshi.cryptoticker.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.unit.dp
import com.patrykandpatrick.vico.compose.chart.Chart
import com.patrykandpatrick.vico.compose.chart.line.lineChart
import com.patrykandpatrick.vico.compose.component.shape.shader.fromBrush
import com.patrykandpatrick.vico.core.chart.line.LineChart
import com.patrykandpatrick.vico.core.component.shape.shader.DynamicShaders
import com.patrykandpatrick.vico.core.entry.ChartEntryModelProducer
import com.patrykandpatrick.vico.core.entry.entryOf
import com.satoshi.cryptoticker.ui.theme.GainGreen
import com.satoshi.cryptoticker.ui.theme.LossRed

@Composable
fun PriceChart(
    prices: List<Pair<Long, Double>>,
    modifier: Modifier = Modifier
) {
    if (prices.isEmpty()) return

    val isGain = prices.last().second >= prices.first().second
    val lineColor = if (isGain) GainGreen else LossRed

    val modelProducer = remember { ChartEntryModelProducer() }

    LaunchedEffect(prices) {
        modelProducer.setEntries(
            prices.mapIndexed { index, (_, price) -> entryOf(index.toFloat(), price.toFloat()) }
        )
    }

    Chart(
        chart = lineChart(
            lines = listOf(
                LineChart.LineSpec(
                    lineColor = lineColor.toArgb(),
                    lineBackgroundShader = DynamicShaders.fromBrush(
                        androidx.compose.ui.graphics.Brush.verticalGradient(
                            listOf(lineColor.copy(alpha = 0.35f), Color.Transparent)
                        )
                    )
                )
            )
        ),
        chartModelProducer = modelProducer,
        modifier = modifier.fillMaxWidth()
    )
}

@Composable
fun SparklineChart(prices: List<Double>, modifier: Modifier = Modifier) {
    if (prices.isEmpty()) return
    PriceChart(
        prices = prices.mapIndexed { i, p -> (i.toLong() * 3600_000L) to p },
        modifier = modifier
    )
}
