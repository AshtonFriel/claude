package com.satoshi.cryptoticker.domain.model

data class Coin(
    val id: String,
    val symbol: String,
    val name: String,
    val imageUrl: String,
    val currentPrice: Double,
    val marketCap: Long,
    val marketCapRank: Int,
    val totalVolume: Long,
    val priceChangePercent1h: Double,
    val priceChangePercent24h: Double,
    val priceChangePercent7d: Double,
    val circulatingSupply: Double,
    val maxSupply: Double?,
    val ath: Double,
    val atl: Double,
    val sparklinePrices: List<Double>,
    val isWatched: Boolean = false
)
