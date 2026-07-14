package com.satoshi.financetracker.ui.screens.payoff

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
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.satoshi.financetracker.domain.DebtMath
import com.satoshi.financetracker.ui.components.EmptyState
import com.satoshi.financetracker.ui.components.SectionCard
import com.satoshi.financetracker.ui.theme.GainGreen
import com.satoshi.financetracker.ui.theme.LossRed
import com.satoshi.financetracker.util.formatMoney
import com.satoshi.financetracker.util.formatMonths
import com.satoshi.financetracker.util.monthsFromNowLabel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PayoffScreen(viewModel: PayoffViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Scaffold(
        topBar = { TopAppBar(title = { Text("Payoff plan") }) }
    ) { padding ->
        if (!state.hasDebts && !state.isLoading) {
            Column(Modifier.padding(padding).fillMaxSize()) {
                EmptyState(
                    icon = Icons.Default.Calculate,
                    title = "No debts to plan for",
                    subtitle = "Add debts with an APR and minimum payment on the Debts tab, then compare payoff strategies here."
                )
            }
            return@Scaffold
        }

        LazyColumn(
            modifier = Modifier.padding(padding).fillMaxSize(),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                SectionCard(title = "Extra toward debt each month") {
                    OutlinedTextField(
                        value = state.extraInput,
                        onValueChange = viewModel::setExtra,
                        label = { Text("Extra monthly payment, e.g. 200") },
                        singleLine = true,
                        prefix = { Text("$") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    val baseline = state.baseline
                    Text(
                        if (baseline != null)
                            "At minimums only: debt-free ${baseline.months.monthsFromNowLabel()} " +
                                "(${baseline.months.formatMonths()}), ${baseline.totalInterest.formatMoney()} total interest"
                        else
                            "At minimum payments alone, these debts never get paid off — interest outpaces the payments.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = if (baseline != null) MaterialTheme.colorScheme.onSurfaceVariant else LossRed
                    )
                }
            }

            item {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    StrategyCard(
                        title = "Avalanche",
                        subtitle = "Highest APR first",
                        result = state.avalanche,
                        baseline = state.baseline,
                        modifier = Modifier.weight(1f)
                    )
                    StrategyCard(
                        title = "Snowball",
                        subtitle = "Smallest balance first",
                        result = state.snowball,
                        baseline = state.baseline,
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            val recommended = pickRecommended(state.avalanche, state.snowball)
            if (recommended != null) {
                val (label, result) = recommended
                item {
                    SectionCard(title = "Recommended order ($label)") {
                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            result.payoffOrder.forEachIndexed { index, debtName ->
                                Row {
                                    Text(
                                        "${index + 1}.",
                                        style = MaterialTheme.typography.bodyMedium,
                                        fontWeight = FontWeight.SemiBold,
                                        color = MaterialTheme.colorScheme.primary
                                    )
                                    Spacer(Modifier.padding(start = 8.dp))
                                    Text(debtName, style = MaterialTheme.typography.bodyMedium)
                                }
                            }
                        }
                        Text(
                            "Pay minimums on everything, then put every spare dollar toward the top of this list.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            item { Spacer(Modifier.height(8.dp)) }
        }
    }
}

private fun pickRecommended(
    avalanche: DebtMath.SimResult?,
    snowball: DebtMath.SimResult?
): Pair<String, DebtMath.SimResult>? = when {
    avalanche == null && snowball == null -> null
    snowball == null -> "Avalanche" to avalanche!!
    avalanche == null -> "Snowball" to snowball
    // Avalanche never costs more interest; prefer it unless they tie, where snowball's quick wins help morale.
    avalanche.totalInterest < snowball.totalInterest - 0.01 -> "Avalanche" to avalanche
    else -> "Snowball" to snowball
}

@Composable
private fun StrategyCard(
    title: String,
    subtitle: String,
    result: DebtMath.SimResult?,
    baseline: DebtMath.SimResult?,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(title, style = MaterialTheme.typography.titleMedium)
            Text(subtitle, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.height(4.dp))
            if (result == null) {
                Text("Never pays off", style = MaterialTheme.typography.titleSmall, color = LossRed)
            } else {
                Text(
                    result.months.monthsFromNowLabel(),
                    style = MaterialTheme.typography.titleLarge,
                    color = GainGreen
                )
                Text(
                    "debt-free in ${result.months.formatMonths()}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    "${result.totalInterest.formatMoney()} interest",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                if (baseline != null && baseline.totalInterest > result.totalInterest + 0.01) {
                    Text(
                        "saves ${(baseline.totalInterest - result.totalInterest).formatMoney()} vs minimums",
                        style = MaterialTheme.typography.bodySmall,
                        color = GainGreen
                    )
                }
            }
        }
    }
}
