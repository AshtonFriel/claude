package com.satoshi.cryptoticker.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.satoshi.cryptoticker.domain.model.Coin
import com.satoshi.cryptoticker.ui.theme.GainGreen
import com.satoshi.cryptoticker.ui.theme.GainGreenSurface
import com.satoshi.cryptoticker.ui.theme.LossRed
import com.satoshi.cryptoticker.ui.theme.LossRedSurface
import com.satoshi.cryptoticker.util.formatPercent
import com.satoshi.cryptoticker.util.formatPrice

@Composable
fun CoinListItem(coin: Coin, onClick: () -> Unit, modifier: Modifier = Modifier) {
    val change = coin.priceChangePercent24h
    val isGain = change >= 0
    val changeColor = if (isGain) GainGreen else LossRed
    val changeSurface = if (isGain) GainGreenSurface else LossRedSurface

    ListItem(
        modifier = modifier.clickable(onClick = onClick),
        headlineContent = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(coin.name, style = MaterialTheme.typography.titleMedium)
                if (coin.id == "bitcoin") {
                    Spacer(Modifier.width(6.dp))
                    Surface(
                        color = MaterialTheme.colorScheme.primary.copy(alpha = 0.15f),
                        shape = RoundedCornerShape(4.dp)
                    ) {
                        Text(
                            "★ BTC",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                        )
                    }
                }
            }
        },
        supportingContent = {
            Text(
                coin.symbol.uppercase(),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        },
        leadingContent = {
            AsyncImage(
                model = coin.imageUrl,
                contentDescription = coin.name,
                modifier = Modifier.size(42.dp).clip(CircleShape)
            )
        },
        trailingContent = {
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    coin.currentPrice.formatPrice(),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(Modifier.height(4.dp))
                Surface(color = changeSurface, shape = RoundedCornerShape(4.dp)) {
                    Text(
                        change.formatPercent(),
                        style = MaterialTheme.typography.labelSmall,
                        color = changeColor,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                    )
                }
            }
        }
    )
}
