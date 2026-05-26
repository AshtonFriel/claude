package com.satoshi.cryptoticker.ui.screens.portfolio

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.satoshi.cryptoticker.domain.model.PortfolioEntry
import com.satoshi.cryptoticker.ui.theme.GainGreen
import com.satoshi.cryptoticker.ui.theme.GainGreenSurface
import com.satoshi.cryptoticker.ui.theme.LossRed
import com.satoshi.cryptoticker.ui.theme.LossRedSurface
import com.satoshi.cryptoticker.util.formatPercent
import com.satoshi.cryptoticker.util.formatPrice

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PortfolioScreen(
    onCoinClick: (String) -> Unit,
    vm: PortfolioViewModel = hiltViewModel()
) {
    val state by vm.state.collectAsState()
    var showAddDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = { TopAppBar(title = { Text("Portfolio", fontWeight = FontWeight.Bold) }) },
        floatingActionButton = {
            FloatingActionButton(onClick = { showAddDialog = true }) {
                Icon(Icons.Default.Add, contentDescription = "Add position")
            }
        }
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding)) {
            if (state.entries.isNotEmpty()) {
                PortfolioSummary(state)
            }

            when {
                state.isLoading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
                state.entries.isEmpty() -> EmptyPortfolio(onAdd = { showAddDialog = true })
                else -> {
                    LazyColumn {
                        items(state.entries, key = { it.coinId }) { entry ->
                            PortfolioEntryRow(
                                entry = entry,
                                onClick = { onCoinClick(entry.coinId) },
                                onDelete = { vm.deleteEntry(entry.coinId) }
                            )
                            HorizontalDivider(thickness = 0.5.dp, color = MaterialTheme.colorScheme.outline.copy(alpha = 0.4f))
                        }
                    }
                }
            }
        }
    }

    if (showAddDialog) {
        AddPositionDialog(
            onDismiss = { showAddDialog = false },
            onConfirm = { coinId, symbol, name, holdings, avgBuy ->
                vm.upsertEntry(coinId, symbol, name, holdings, avgBuy)
                showAddDialog = false
            }
        )
    }
}

@Composable
private fun PortfolioSummary(state: PortfolioUiState) {
    val isGain = state.totalPnl >= 0
    Surface(
        modifier = Modifier.fillMaxWidth().padding(16.dp),
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surfaceVariant,
        tonalElevation = 2.dp
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Text("Total Portfolio Value", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(state.totalValue.formatPrice(), style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.ExtraBold)
            Spacer(Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                Column {
                    Text("Cost Basis", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(state.totalCost.formatPrice(), style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
                }
                Column {
                    Text("P&L", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(
                        buildString {
                            append(state.totalPnl.formatPrice())
                            if (state.totalCost > 0) append(" (${(state.totalPnl / state.totalCost * 100).formatPercent()})")
                        },
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = if (isGain) GainGreen else LossRed
                    )
                }
            }
        }
    }
}

@Composable
private fun PortfolioEntryRow(entry: PortfolioEntry, onClick: () -> Unit, onDelete: () -> Unit) {
    val isGain = entry.pnl >= 0
    ListItem(
        modifier = Modifier.clickable(onClick = onClick),
        headlineContent = { Text(entry.name, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold) },
        supportingContent = {
            Text(
                "${entry.holdings} ${entry.symbol.uppercase()}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        },
        trailingContent = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(horizontalAlignment = Alignment.End) {
                    Text(entry.currentValue.formatPrice(), style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
                    Surface(color = if (isGain) GainGreenSurface else LossRedSurface, shape = RoundedCornerShape(4.dp)) {
                        Text(
                            entry.pnlPercent.formatPercent(),
                            color = if (isGain) GainGreen else LossRed,
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                        )
                    }
                }
                IconButton(onClick = onDelete) {
                    Icon(Icons.Default.Delete, contentDescription = "Remove", modifier = Modifier.size(18.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
    )
}

@Composable
private fun EmptyPortfolio(onAdd: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize().padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(Icons.Default.AccountBalanceWallet, contentDescription = null, modifier = Modifier.size(64.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(16.dp))
        Text("No positions yet", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(8.dp))
        FilledTonalButton(onClick = onAdd) { Text("Add Position") }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AddPositionDialog(
    onDismiss: () -> Unit,
    onConfirm: (String, String, String, Double, Double) -> Unit
) {
    var coinId by remember { mutableStateOf("bitcoin") }
    var symbol by remember { mutableStateOf("btc") }
    var name by remember { mutableStateOf("Bitcoin") }
    var holdings by remember { mutableStateOf("") }
    var avgBuy by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add Position") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(value = coinId, onValueChange = { coinId = it }, label = { Text("Coin ID (e.g. bitcoin)") }, singleLine = true)
                OutlinedTextField(value = symbol, onValueChange = { symbol = it }, label = { Text("Symbol (e.g. btc)") }, singleLine = true)
                OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Name") }, singleLine = true)
                OutlinedTextField(value = holdings, onValueChange = { holdings = it }, label = { Text("Holdings amount") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal), singleLine = true)
                OutlinedTextField(value = avgBuy, onValueChange = { avgBuy = it }, label = { Text("Average buy price (USD)") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal), singleLine = true)
            }
        },
        confirmButton = {
            TextButton(onClick = {
                val h = holdings.toDoubleOrNull() ?: return@TextButton
                val a = avgBuy.toDoubleOrNull() ?: return@TextButton
                onConfirm(coinId.trim(), symbol.trim().lowercase(), name.trim(), h, a)
            }) { Text("Add") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } }
    )
}
