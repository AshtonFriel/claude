package com.satoshi.cryptoticker.ui.screens.dashboard

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.satoshi.cryptoticker.ui.components.CoinListItem
import com.satoshi.cryptoticker.ui.components.ErrorView

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onCoinClick: (String) -> Unit,
    vm: DashboardViewModel = hiltViewModel()
) {
    val state by vm.state.collectAsState()

    PullToRefreshBox(
        isRefreshing = state.isRefreshing,
        onRefresh = { vm.refresh() },
        modifier = Modifier.fillMaxSize()
    ) {
        Column(Modifier.fillMaxSize()) {
            TopAppBar(title = { Text("Watchlist", fontWeight = FontWeight.Bold) })

            when {
                state.isLoading && state.coins.isEmpty() -> {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator()
                    }
                }
                state.error != null && state.coins.isEmpty() -> {
                    ErrorView(
                        message = state.error ?: "",
                        isRateLimit = state.isRateLimit,
                        onRetry = { vm.refresh() },
                        modifier = Modifier.fillMaxSize()
                    )
                }
                else -> {
                    LazyColumn(Modifier.fillMaxSize()) {
                        items(state.coins, key = { it.id }) { coin ->
                            CoinListItem(coin = coin, onClick = { onCoinClick(coin.id) })
                            HorizontalDivider(thickness = 0.5.dp, color = MaterialTheme.colorScheme.outline.copy(alpha = 0.4f))
                        }
                    }
                }
            }
        }
    }
}
