package com.satoshi.cryptoticker.ui.screens.bitcoin

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.satoshi.cryptoticker.domain.model.BitcoinStats
import com.satoshi.cryptoticker.domain.model.Coin
import com.satoshi.cryptoticker.domain.model.FearGreedIndex
import com.satoshi.cryptoticker.ui.components.*
import com.satoshi.cryptoticker.ui.theme.*
import com.satoshi.cryptoticker.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BitcoinDashboardScreen(
    onCoinClick: (String) -> Unit,
    vm: BitcoinViewModel = hiltViewModel()
) {
    val state by vm.state.collectAsState()
    var isRefreshing by remember { mutableStateOf(false) }

    LaunchedEffect(state.isLoading) {
        if (!state.isLoading) isRefreshing = false
    }

    PullToRefreshBox(
        isRefreshing = isRefreshing,
        onRefresh = { isRefreshing = true; vm.load() },
        modifier = Modifier.fillMaxSize()
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
        ) {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.CurrencyBitcoin, contentDescription = null, tint = Bitcoin, modifier = Modifier.size(28.dp))
                        Spacer(Modifier.width(8.dp))
                        Text("Bitcoin", style = MaterialTheme.typography.titleLarge, color = Bitcoin, fontWeight = FontWeight.Bold)
                    }
                },
                actions = {
                    IconButton(onClick = { vm.load() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                    }
                }
            )

            if (state.isLoading && state.btc == null) {
                Box(Modifier.fillMaxWidth().height(200.dp), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Bitcoin)
                }
            } else if (state.error != null && state.btc == null) {
                ErrorView(
                    message = state.error ?: "",
                    isRateLimit = state.isRateLimit,
                    onRetry = { vm.load() },
                    modifier = Modifier.fillMaxWidth().height(200.dp)
                )
            } else {
                state.btc?.let { btc -> BitcoinPriceHero(btc, onClick = { onCoinClick("bitcoin") }) }
                state.stats?.let { stats -> BitcoinStatsSection(stats) }
                state.btc?.let { btc -> SparklineSection(btc) }
            }

            Spacer(Modifier.height(16.dp))
        }
    }
}

@Composable
private fun BitcoinPriceHero(btc: Coin, onClick: () -> Unit) {
    Surface(
        modifier = Modifier.fillMaxWidth().padding(16.dp).clickable(onClick = onClick),
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surfaceVariant,
        tonalElevation = 2.dp
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text("Bitcoin", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(
                        btc.currentPrice.formatPrice(),
                        style = MaterialTheme.typography.headlineLarge,
                        fontWeight = FontWeight.ExtraBold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
                ChangeBadge(btc.priceChangePercent24h, large = true)
            }
            Spacer(Modifier.height(12.dp))
            Row(horizontalArrangement = Arrangement.SpaceEvenly, modifier = Modifier.fillMaxWidth()) {
                MiniStat("1h", btc.priceChangePercent1h)
                MiniStat("24h", btc.priceChangePercent24h)
                MiniStat("7d", btc.priceChangePercent7d)
            }
        }
    }
}

@Composable
private fun ChangeBadge(change: Double, large: Boolean = false) {
    val isGain = change >= 0
    Surface(
        color = if (isGain) GainGreenSurface else LossRedSurface,
        shape = RoundedCornerShape(8.dp)
    ) {
        Text(
            change.formatPercent(),
            color = if (isGain) GainGreen else LossRed,
            fontWeight = FontWeight.Bold,
            fontSize = if (large) 16.sp else 12.sp,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
        )
    }
}

@Composable
private fun MiniStat(label: String, change: Double) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(label, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(
            change.formatPercent(),
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.SemiBold,
            color = if (change >= 0) GainGreen else LossRed
        )
    }
}

@Composable
private fun BitcoinStatsSection(stats: BitcoinStats) {
    Column(modifier = Modifier.padding(horizontal = 16.dp)) {
        Text("Bitcoin Stats", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, modifier = Modifier.padding(bottom = 12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            StatCard("BTC Dominance", "${String.format("%.1f", stats.dominancePercent)}%", modifier = Modifier.weight(1f), valueColor = Bitcoin)
            StatCard("Block Height", "%,d".format(stats.blockHeight), modifier = Modifier.weight(1f))
        }
        Spacer(Modifier.height(12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            StatCard(
                label = "Blocks to Halving",
                value = "%,d".format(stats.blocksUntilHalving),
                subtitle = "~${stats.blocksUntilHalving.formatBlocksToTime()}",
                modifier = Modifier.weight(1f),
                valueColor = Bitcoin
            )
            stats.fearGreed?.let { fg ->
                FearGreedCard(fg, Modifier.weight(1f))
            } ?: StatCard("Fear & Greed", "—", modifier = Modifier.weight(1f))
        }

        stats.fees?.let { fees ->
            Spacer(Modifier.height(16.dp))
            Text("Mempool Fee Estimates (sat/vB)", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(bottom = 8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FeeChip("Fast", fees.fastest, Modifier.weight(1f))
                FeeChip("30min", fees.halfHour, Modifier.weight(1f))
                FeeChip("1hr", fees.hour, Modifier.weight(1f))
                FeeChip("Eco", fees.economy, Modifier.weight(1f))
            }
        }

        stats.lightning?.let { ln ->
            Spacer(Modifier.height(16.dp))
            Text("Lightning Network", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(bottom = 8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                StatCard("Channels", "%,d".format(ln.channelCount), modifier = Modifier.weight(1f))
                StatCard("Nodes", "%,d".format(ln.nodeCount), modifier = Modifier.weight(1f))
                StatCard("Capacity", "${String.format("%.0f", ln.totalCapacityBtc)} BTC", modifier = Modifier.weight(1f))
            }
        }
    }
}

@Composable
private fun FearGreedCard(fg: FearGreedIndex, modifier: Modifier) {
    val color = when {
        fg.value >= 75 -> GainGreen
        fg.value >= 55 -> Color(0xFF8BC34A)
        fg.value >= 45 -> Color(0xFFFFC107)
        fg.value >= 25 -> Color(0xFFFF9800)
        else -> LossRed
    }
    StatCard("Fear & Greed", "${fg.value} — ${fg.classification}", modifier = modifier, valueColor = color)
}

@Composable
private fun FeeChip(label: String, value: Int, modifier: Modifier = Modifier) {
    Surface(shape = RoundedCornerShape(8.dp), color = MaterialTheme.colorScheme.surfaceVariant, modifier = modifier) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(8.dp)) {
            Text(label, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text("$value", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = Bitcoin)
        }
    }
}

@Composable
private fun SparklineSection(btc: Coin) {
    if (btc.sparklinePrices.isNotEmpty()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("7-Day Price", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(bottom = 8.dp))
            SparklineChart(btc.sparklinePrices, modifier = Modifier.height(100.dp))
        }
    }
}
