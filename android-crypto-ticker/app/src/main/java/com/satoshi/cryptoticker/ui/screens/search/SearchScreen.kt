package com.satoshi.cryptoticker.ui.screens.search

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import com.satoshi.cryptoticker.data.repository.SearchCoin

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchScreen(
    onCoinClick: (String) -> Unit,
    vm: SearchViewModel = hiltViewModel()
) {
    val state by vm.state.collectAsState()

    Column(Modifier.fillMaxSize()) {
        TopAppBar(title = { Text("Search", fontWeight = FontWeight.Bold) })

        OutlinedTextField(
            value = state.query,
            onValueChange = { vm.onQueryChange(it) },
            placeholder = { Text("Search cryptocurrencies...") },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
            singleLine = true,
            shape = RoundedCornerShape(12.dp)
        )

        when {
            state.isLoading -> Box(Modifier.fillMaxWidth().height(200.dp), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
            state.error != null -> Box(Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                Text(state.error ?: "", color = MaterialTheme.colorScheme.error)
            }
            state.query.isNotBlank() && state.results.isEmpty() -> Box(Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                Text("No results for \"${state.query}\"", color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            else -> LazyColumn(Modifier.fillMaxSize()) {
                items(state.results, key = { it.id }) { coin ->
                    SearchResultItem(
                        coin = coin,
                        onClick = { onCoinClick(coin.id) },
                        onAdd = { vm.addToWatchlist(coin) }
                    )
                    HorizontalDivider(thickness = 0.5.dp, color = MaterialTheme.colorScheme.outline.copy(alpha = 0.4f))
                }
            }
        }
    }
}

@Composable
private fun SearchResultItem(coin: SearchCoin, onClick: () -> Unit, onAdd: () -> Unit) {
    ListItem(
        modifier = Modifier.clickable(onClick = onClick),
        headlineContent = { Text(coin.name, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold) },
        supportingContent = {
            Text(
                buildString {
                    append(coin.symbol.uppercase())
                    coin.marketCapRank?.let { append("  •  Rank #$it") }
                },
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        },
        leadingContent = {
            AsyncImage(
                model = coin.thumbUrl,
                contentDescription = coin.name,
                modifier = Modifier.size(40.dp).clip(CircleShape)
            )
        },
        trailingContent = {
            IconButton(onClick = onAdd) {
                Icon(Icons.Default.Add, contentDescription = "Add to watchlist", tint = MaterialTheme.colorScheme.primary)
            }
        }
    )
}
