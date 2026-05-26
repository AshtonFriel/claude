package com.satoshi.cryptoticker.ui.screens.detail

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import com.satoshi.cryptoticker.domain.model.Coin
import com.satoshi.cryptoticker.ui.components.*
import com.satoshi.cryptoticker.ui.theme.*
import com.satoshi.cryptoticker.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DetailScreen(
    coinId: String,
    onBack: () -> Unit,
    vm: DetailViewModel = hiltViewModel()
) {
    val state by vm.state.collectAsState()
    var showAlertDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(state.coin?.name ?: coinId) },
                navigationIcon = {
                    IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, contentDescription = "Back") }
                },
                actions = {
                    IconButton(onClick = { vm.toggleWatchlist() }) {
                        Icon(
                            if (state.isWatched) Icons.Default.Star else Icons.Default.StarBorder,
                            contentDescription = "Watchlist",
                            tint = if (state.isWatched) Bitcoin else MaterialTheme.colorScheme.onSurface
                        )
                    }
                    IconButton(onClick = { showAlertDialog = true }) {
                        Icon(Icons.Default.NotificationsNone, contentDescription = "Alert")
                    }
                }
            )
        }
    ) { padding ->
        when {
            state.isLoading -> Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
            state.error != null && state.coin == null -> ErrorView(state.error ?: "", onRetry = { vm.loadCoin() }, modifier = Modifier.fillMaxSize().padding(padding))
            else -> {
                state.coin?.let { coin ->
                    Column(
                        modifier = Modifier.fillMaxSize().padding(padding).verticalScroll(rememberScrollState())
                    ) {
                        CoinHeader(coin)
                        Spacer(Modifier.height(16.dp))
                        ChartSection(state, vm)
                        Spacer(Modifier.height(16.dp))
                        MarketStatsSection(coin)
                        if (coin.id == "bitcoin") {
                            Spacer(Modifier.height(16.dp))
                            BitcoinOnlySection(coin)
                        }
                        if (state.alerts.isNotEmpty()) {
                            Spacer(Modifier.height(16.dp))
                            AlertsSection(state.alerts)
                        }
                        Spacer(Modifier.height(32.dp))
                    }
                }
            }
        }
    }

    if (showAlertDialog) {
        AlertDialog(
            onDismissRequest = { showAlertDialog = false },
            coin = state.coin,
            onConfirm = { price, isAbove ->
                vm.addAlert(price, isAbove)
                showAlertDialog = false
            }
        )
    }
}

@Composable
private fun CoinHeader(coin: Coin) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        AsyncImage(model = coin.imageUrl, contentDescription = coin.name, modifier = Modifier.size(52.dp).clip(CircleShape))
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            Text(coin.symbol.uppercase(), style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(coin.currentPrice.formatPrice(), style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.ExtraBold)
        }
        Column(horizontalAlignment = Alignment.End) {
            ChangeChip(coin.priceChangePercent24h, "24h")
            Spacer(Modifier.height(4.dp))
            ChangeChip(coin.priceChangePercent7d, "7d")
        }
    }
}

@Composable
private fun ChangeChip(change: Double, label: String) {
    val isGain = change >= 0
    Row(verticalAlignment = Alignment.CenterVertically) {
        Text("$label ", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Surface(color = if (isGain) GainGreenSurface else LossRedSurface, shape = RoundedCornerShape(4.dp)) {
            Text(
                change.formatPercent(),
                color = if (isGain) GainGreen else LossRed,
                style = MaterialTheme.typography.labelSmall,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
            )
        }
    }
}

@Composable
private fun ChartSection(state: DetailUiState, vm: DetailViewModel) {
    Column(modifier = Modifier.padding(horizontal = 16.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            ChartRange.values().forEach { range ->
                FilterChip(
                    selected = state.chartRange == range,
                    onClick = { vm.loadChart(range) },
                    label = { Text(range.label) }
                )
            }
        }
        Spacer(Modifier.height(8.dp))
        if (state.chartLoading) {
            Box(Modifier.fillMaxWidth().height(200.dp), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(modifier = Modifier.size(24.dp))
            }
        } else if (state.chartData.isNotEmpty()) {
            PriceChart(prices = state.chartData, modifier = Modifier.height(200.dp))
        }
    }
}

@Composable
private fun MarketStatsSection(coin: Coin) {
    Surface(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
        shape = RoundedCornerShape(12.dp),
        color = MaterialTheme.colorScheme.surfaceVariant
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Market Stats", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(8.dp))
            HorizontalDivider()
            StatRow("Market Cap Rank", "#${coin.marketCapRank}")
            StatRow("Market Cap", coin.marketCap.formatLarge())
            StatRow("24h Volume", coin.totalVolume.formatLarge())
            StatRow("Circulating Supply", "${coin.circulatingSupply.formatSupply()} ${coin.symbol.uppercase()}")
            coin.maxSupply?.let { StatRow("Max Supply", "${it.formatSupply()} ${coin.symbol.uppercase()}") }
            StatRow("All-Time High", coin.ath.formatPrice(), valueColor = GainGreen)
            StatRow("All-Time Low", coin.atl.formatPrice(), valueColor = LossRed)
        }
    }
}

@Composable
private fun BitcoinOnlySection(coin: Coin) {
    Surface(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
        shape = RoundedCornerShape(12.dp),
        color = Bitcoin.copy(alpha = 0.08f)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.CurrencyBitcoin, contentDescription = null, tint = Bitcoin, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(6.dp))
                Text("Bitcoin Details", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = Bitcoin)
            }
            Spacer(Modifier.height(8.dp))
            val supplyPct = if (coin.maxSupply != null && coin.maxSupply > 0) coin.circulatingSupply / coin.maxSupply * 100 else 0.0
            StatRow("Supply Issued", "${String.format("%.1f", supplyPct)}% of 21M")
            LinearProgressIndicator(
                progress = { (supplyPct / 100).toFloat() },
                color = Bitcoin,
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
            )
        }
    }
}

@Composable
private fun AlertsSection(alerts: List<com.satoshi.cryptoticker.domain.model.PriceAlert>) {
    Column(modifier = Modifier.padding(horizontal = 16.dp)) {
        Text("Active Alerts", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(8.dp))
        alerts.forEach { alert ->
            Surface(shape = RoundedCornerShape(8.dp), color = MaterialTheme.colorScheme.surfaceVariant, modifier = Modifier.fillMaxWidth().padding(bottom = 6.dp)) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        if (alert.isAbove) Icons.Default.TrendingUp else Icons.Default.TrendingDown,
                        contentDescription = null,
                        tint = if (alert.isAbove) GainGreen else LossRed,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(Modifier.width(8.dp))
                    Text(
                        "${if (alert.isAbove) "Above" else "Below"} ${alert.targetPrice.formatPrice()}",
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AlertDialog(
    onDismissRequest: () -> Unit,
    coin: Coin?,
    onConfirm: (Double, Boolean) -> Unit
) {
    var priceText by remember { mutableStateOf("") }
    var isAbove by remember { mutableStateOf(true) }

    AlertDialog(
        onDismissRequest = onDismissRequest,
        title = { Text("Set Price Alert") },
        text = {
            Column {
                Text("Current: ${coin?.currentPrice?.formatPrice() ?: "—"}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Spacer(Modifier.height(12.dp))
                OutlinedTextField(
                    value = priceText,
                    onValueChange = { priceText = it },
                    label = { Text("Target price (USD)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    singleLine = true
                )
                Spacer(Modifier.height(12.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("Trigger when price goes", style = MaterialTheme.typography.bodyMedium)
                }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FilterChip(selected = isAbove, onClick = { isAbove = true }, label = { Text("Above") })
                    FilterChip(selected = !isAbove, onClick = { isAbove = false }, label = { Text("Below") })
                }
            }
        },
        confirmButton = {
            TextButton(onClick = {
                priceText.toDoubleOrNull()?.let { onConfirm(it, isAbove) }
            }) { Text("Set Alert") }
        },
        dismissButton = { TextButton(onClick = onDismissRequest) { Text("Cancel") } }
    )
}
