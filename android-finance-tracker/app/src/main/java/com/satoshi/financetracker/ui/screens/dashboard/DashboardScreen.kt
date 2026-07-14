package com.satoshi.financetracker.ui.screens.dashboard

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Savings
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.satoshi.financetracker.ui.components.AllocationRow
import com.satoshi.financetracker.ui.components.EmptyState
import com.satoshi.financetracker.ui.components.ErrorBanner
import com.satoshi.financetracker.ui.components.NetWorthChart
import com.satoshi.financetracker.ui.components.SectionCard
import com.satoshi.financetracker.ui.components.StatCard
import com.satoshi.financetracker.ui.theme.Accent
import com.satoshi.financetracker.ui.theme.GainGreen
import com.satoshi.financetracker.ui.theme.LossRed
import com.satoshi.financetracker.util.formatMoney
import com.satoshi.financetracker.util.formatMoneySigned

private val typeColors = listOf(Accent, GainGreen, Color(0xFFB388FF), Color(0xFFFFB300), Color(0xFF26C6DA), LossRed)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(viewModel: DashboardViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Overview") },
                actions = {
                    if (state.isLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.padding(end = 16.dp).height(24.dp),
                            strokeWidth = 2.dp
                        )
                    } else {
                        IconButton(onClick = { viewModel.refresh() }) {
                            Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                        }
                    }
                }
            )
        }
    ) { padding ->
        if (!state.hasAnyData && !state.isLoading) {
            Column(Modifier.padding(padding).fillMaxSize()) {
                EmptyState(
                    icon = Icons.Default.Savings,
                    title = "Nothing tracked yet",
                    subtitle = "Add investments and debts from the tabs below to see your net worth here."
                )
            }
            return@Scaffold
        }

        LazyColumn(
            modifier = Modifier.padding(padding).fillMaxSize(),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            if (state.error != null) {
                item { ErrorBanner(state.error!!) }
            }

            item {
                SectionCard(title = "Net worth") {
                    Text(
                        state.netWorth.formatMoney(),
                        style = MaterialTheme.typography.displaySmall,
                        color = if (state.netWorth >= 0) GainGreen else LossRed
                    )
                    val snaps = state.snapshots
                    if (snaps.size >= 2) {
                        val delta = snaps.last().netWorth - snaps.first().netWorth
                        Text(
                            "${delta.formatMoneySigned()} since tracking began",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            item {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    StatCard(
                        label = "Assets",
                        value = state.totalAssets.formatMoney(),
                        valueColor = GainGreen,
                        modifier = Modifier.weight(1f)
                    )
                    StatCard(
                        label = "Debts",
                        value = state.totalDebts.formatMoney(),
                        valueColor = LossRed,
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            if (state.snapshots.size >= 2) {
                item {
                    SectionCard(title = "Net worth over time") {
                        NetWorthChart(state.snapshots, Modifier.height(180.dp))
                    }
                }
            }

            if (state.assetsByType.isNotEmpty()) {
                item {
                    SectionCard(title = "Asset allocation") {
                        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                            val total = state.totalAssets.takeIf { it > 0 } ?: 1.0
                            state.assetsByType.forEachIndexed { index, (type, amount) ->
                                AllocationRow(
                                    label = type.label,
                                    amountLabel = amount.formatMoney(),
                                    fraction = (amount / total).toFloat(),
                                    color = typeColors[index % typeColors.size]
                                )
                            }
                        }
                    }
                }
            }

            if (state.debtsByCategory.isNotEmpty()) {
                item {
                    SectionCard(title = "Debt breakdown") {
                        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                            val total = state.totalDebts.takeIf { it > 0 } ?: 1.0
                            state.debtsByCategory.forEachIndexed { index, (category, amount) ->
                                AllocationRow(
                                    label = category.label,
                                    amountLabel = amount.formatMoney(),
                                    fraction = (amount / total).toFloat(),
                                    color = typeColors.reversed()[index % typeColors.size]
                                )
                            }
                        }
                    }
                }
            }

            item { Spacer(Modifier.height(8.dp)) }
        }
    }
}
