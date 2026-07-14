package com.satoshi.financetracker.ui.screens.investments

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.TrendingUp
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.satoshi.financetracker.domain.model.Holding
import com.satoshi.financetracker.domain.model.HoldingType
import com.satoshi.financetracker.domain.model.SymbolMatch
import com.satoshi.financetracker.ui.components.EmptyState
import com.satoshi.financetracker.ui.components.ErrorBanner
import com.satoshi.financetracker.ui.components.StatCard
import com.satoshi.financetracker.ui.theme.GainGreen
import com.satoshi.financetracker.ui.theme.LossRed
import com.satoshi.financetracker.util.formatMoney
import com.satoshi.financetracker.util.formatMoneyExact
import com.satoshi.financetracker.util.formatMoneySigned
import com.satoshi.financetracker.util.formatPercent

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InvestmentsScreen(viewModel: InvestmentsViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val searchState by viewModel.searchState.collectAsStateWithLifecycle()

    var sheetOpen by remember { mutableStateOf(false) }
    var editing by remember { mutableStateOf<Holding?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Investments") },
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
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { editing = null; sheetOpen = true }) {
                Icon(Icons.Default.Add, contentDescription = "Add investment")
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.padding(padding).fillMaxSize(),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            if (state.error != null) {
                item { ErrorBanner(state.error!!) }
            }

            item {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    StatCard(
                        label = "Total value",
                        value = state.totalValue.formatMoney(),
                        modifier = Modifier.weight(1f)
                    )
                    val gain = state.totalGainLoss
                    StatCard(
                        label = "Gain / loss",
                        value = gain?.formatMoneySigned() ?: "—",
                        valueColor = when {
                            gain == null -> MaterialTheme.colorScheme.onSurface
                            gain >= 0 -> GainGreen
                            else -> LossRed
                        },
                        caption = state.totalGainLossPercent?.formatPercent(),
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            if (state.holdings.isEmpty() && !state.isLoading) {
                item {
                    EmptyState(
                        icon = Icons.AutoMirrored.Filled.TrendingUp,
                        title = "No investments yet",
                        subtitle = "Tap + to add stocks, ETFs, crypto, or manually valued assets like real estate."
                    )
                }
            }

            items(state.holdings, key = { it.id }) { holding ->
                HoldingCard(holding) { editing = holding; sheetOpen = true }
            }

            item { Spacer(Modifier.height(72.dp)) }
        }
    }

    if (sheetOpen) {
        HoldingSheet(
            editing = editing,
            searchState = searchState,
            onSearch = viewModel::search,
            onDismiss = {
                sheetOpen = false
                viewModel.clearSearch()
            },
            onSave = { id, name, type, symbol, qty, avgCost, manualValue ->
                viewModel.saveHolding(id, name, type, symbol, qty, avgCost, manualValue)
                sheetOpen = false
                viewModel.clearSearch()
            },
            onDelete = { id ->
                viewModel.deleteHolding(id)
                sheetOpen = false
                viewModel.clearSearch()
            }
        )
    }
}

@Composable
private fun HoldingCard(holding: Holding, onClick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text(holding.name, style = MaterialTheme.typography.titleMedium)
                val detail = when {
                    holding.quoteSymbol != null && holding.currentPrice != null ->
                        "${holding.quoteSymbol} · ${trimQty(holding.quantity)} @ ${holding.currentPrice.formatMoneyExact()}"
                    holding.quoteSymbol != null -> "${holding.quoteSymbol} · price unavailable"
                    else -> holding.type.label
                }
                Text(
                    detail,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            Spacer(Modifier.width(8.dp))
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    holding.currentValue.formatMoney(),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )
                val gain = holding.gainLoss
                if (gain != null) {
                    val pct = holding.gainLossPercent?.let { " (${it.formatPercent()})" } ?: ""
                    Text(
                        gain.formatMoneySigned() + pct,
                        style = MaterialTheme.typography.bodySmall,
                        color = if (gain >= 0) GainGreen else LossRed
                    )
                } else {
                    holding.dayChangePercent?.let { day ->
                        Text(
                            "${day.formatPercent()} today",
                            style = MaterialTheme.typography.bodySmall,
                            color = if (day >= 0) GainGreen else LossRed
                        )
                    }
                }
            }
        }
    }
}

private fun trimQty(qty: Double): String =
    if (qty == qty.toLong().toDouble()) qty.toLong().toString() else qty.toString()

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun HoldingSheet(
    editing: Holding?,
    searchState: SymbolSearchState,
    onSearch: (String) -> Unit,
    onDismiss: () -> Unit,
    onSave: (id: Long?, name: String, type: HoldingType, symbol: String?, qty: Double, avgCost: Double?, manualValue: Double?) -> Unit,
    onDelete: (Long) -> Unit
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    var isManual by remember { mutableStateOf(editing?.quoteSymbol == null && editing != null) }
    var selectedSymbol by remember { mutableStateOf(editing?.quoteSymbol) }
    var selectedType by remember { mutableStateOf(editing?.type ?: HoldingType.STOCK) }
    var name by remember { mutableStateOf(editing?.name ?: "") }
    var quantityText by remember { mutableStateOf(editing?.quantity?.let { trimQty(it) } ?: "") }
    var avgCostText by remember { mutableStateOf(editing?.avgCostPerUnit?.let { trimQty(it) } ?: "") }
    var manualValueText by remember { mutableStateOf(editing?.manualValue?.let { trimQty(it) } ?: "") }

    ModalBottomSheet(onDismissRequest = onDismiss, sheetState = sheetState) {
        Column(
            Modifier
                .padding(horizontal = 20.dp)
                .padding(bottom = 24.dp)
                .imePadding(),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                if (editing == null) "Add investment" else "Edit investment",
                style = MaterialTheme.typography.titleLarge
            )

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(
                    selected = !isManual,
                    onClick = { isManual = false },
                    label = { Text("Stock / Crypto") }
                )
                FilterChip(
                    selected = isManual,
                    onClick = { isManual = true },
                    label = { Text("Manual value") }
                )
            }

            if (!isManual) {
                if (selectedSymbol == null) {
                    OutlinedTextField(
                        value = searchState.query,
                        onValueChange = onSearch,
                        label = { Text("Search ticker or name (e.g. AAPL, bitcoin)") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    if (searchState.isSearching) {
                        CircularProgressIndicator(Modifier.padding(8.dp).height(20.dp), strokeWidth = 2.dp)
                    }
                    LazyColumn(Modifier.heightIn(max = 220.dp)) {
                        items(searchState.results, key = { it.symbol }) { match ->
                            SearchResultRow(match) {
                                selectedSymbol = match.symbol
                                name = match.name
                                selectedType = if (match.isCrypto) HoldingType.CRYPTO else HoldingType.STOCK
                            }
                        }
                    }
                } else {
                    Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)) {
                        Row(Modifier.padding(12.dp).fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                            Column(Modifier.weight(1f)) {
                                Text(selectedSymbol!!, style = MaterialTheme.typography.titleMedium)
                                Text(name, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                            OutlinedButton(onClick = { selectedSymbol = null }) { Text("Change") }
                        }
                    }
                    OutlinedTextField(
                        value = quantityText,
                        onValueChange = { quantityText = it },
                        label = { Text("Quantity") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = avgCostText,
                        onValueChange = { avgCostText = it },
                        label = { Text("Avg cost per unit (optional, for gain/loss)") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            } else {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Name (e.g. Home, 401k, Savings)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = manualValueText,
                    onValueChange = { manualValueText = it },
                    label = { Text("Current value") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = avgCostText,
                    onValueChange = { avgCostText = it },
                    label = { Text("Original cost (optional, for gain/loss)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            }

            val canSave = if (isManual) {
                name.isNotBlank() && manualValueText.toDoubleOrNull() != null
            } else {
                selectedSymbol != null && (quantityText.toDoubleOrNull() ?: 0.0) > 0.0
            }

            Button(
                onClick = {
                    if (isManual) {
                        onSave(
                            editing?.id, name.trim(), HoldingType.MANUAL, null,
                            1.0, avgCostText.toDoubleOrNull(), manualValueText.toDoubleOrNull()
                        )
                    } else {
                        onSave(
                            editing?.id, name.trim(), selectedType, selectedSymbol,
                            quantityText.toDoubleOrNull() ?: 0.0, avgCostText.toDoubleOrNull(), null
                        )
                    }
                },
                enabled = canSave,
                modifier = Modifier.fillMaxWidth()
            ) { Text("Save") }

            if (editing != null) {
                OutlinedButton(
                    onClick = { onDelete(editing.id) },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Default.Delete, contentDescription = null, modifier = Modifier.height(18.dp))
                    Spacer(Modifier.width(6.dp))
                    Text("Delete", color = LossRed)
                }
            }
        }
    }
}

@Composable
private fun SearchResultRow(match: SymbolMatch, onClick: () -> Unit) {
    Row(
        Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(vertical = 10.dp, horizontal = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(Modifier.weight(1f)) {
            Text(match.symbol, style = MaterialTheme.typography.titleSmall)
            Text(
                match.name,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        Text(
            listOfNotNull(match.quoteType.lowercase().replaceFirstChar { it.uppercase() }, match.exchange)
                .joinToString(" · "),
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}
