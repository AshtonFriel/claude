package com.satoshi.financetracker.ui.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import com.patrykandpatrick.vico.compose.chart.Chart
import com.patrykandpatrick.vico.compose.chart.line.lineChart
import com.patrykandpatrick.vico.compose.component.shape.shader.fromBrush
import com.patrykandpatrick.vico.core.chart.line.LineChart
import com.patrykandpatrick.vico.core.component.shape.shader.DynamicShaders
import com.patrykandpatrick.vico.core.entry.ChartEntryModelProducer
import com.patrykandpatrick.vico.core.entry.entryOf
import com.satoshi.financetracker.data.db.entity.SnapshotEntity
import com.satoshi.financetracker.ui.theme.GainGreen
import com.satoshi.financetracker.ui.theme.LossRed

@Composable
fun NetWorthChart(snapshots: List<SnapshotEntity>, modifier: Modifier = Modifier) {
    if (snapshots.size < 2) return

    val isGain = snapshots.last().netWorth >= snapshots.first().netWorth
    val lineColor = if (isGain) GainGreen else LossRed

    val modelProducer = remember { ChartEntryModelProducer() }

    LaunchedEffect(snapshots) {
        modelProducer.setEntries(
            snapshots.mapIndexed { index, snap -> entryOf(index.toFloat(), snap.netWorth.toFloat()) }
        )
    }

    Chart(
        chart = lineChart(
            lines = listOf(
                LineChart.LineSpec(
                    lineColor = lineColor.toArgb(),
                    lineBackgroundShader = DynamicShaders.fromBrush(
                        Brush.verticalGradient(
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
