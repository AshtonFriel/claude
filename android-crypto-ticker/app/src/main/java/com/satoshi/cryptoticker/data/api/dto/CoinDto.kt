package com.satoshi.cryptoticker.data.api.dto

import com.google.gson.annotations.SerializedName

data class CoinDto(
    @SerializedName("id") val id: String,
    @SerializedName("symbol") val symbol: String,
    @SerializedName("name") val name: String,
    @SerializedName("image") val image: String,
    @SerializedName("current_price") val currentPrice: Double,
    @SerializedName("market_cap") val marketCap: Long,
    @SerializedName("market_cap_rank") val marketCapRank: Int,
    @SerializedName("total_volume") val totalVolume: Long,
    @SerializedName("price_change_percentage_24h") val priceChangePercentage24h: Double?,
    @SerializedName("price_change_percentage_7d_in_currency") val priceChangePercentage7d: Double?,
    @SerializedName("price_change_percentage_1h_in_currency") val priceChangePercentage1h: Double?,
    @SerializedName("circulating_supply") val circulatingSupply: Double?,
    @SerializedName("max_supply") val maxSupply: Double?,
    @SerializedName("ath") val ath: Double?,
    @SerializedName("atl") val atl: Double?,
    @SerializedName("sparkline_in_7d") val sparkline: SparklineDto?
)

data class SparklineDto(
    @SerializedName("price") val price: List<Double>
)
