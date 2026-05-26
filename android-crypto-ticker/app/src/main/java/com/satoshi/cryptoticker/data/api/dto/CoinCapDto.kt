package com.satoshi.cryptoticker.data.api.dto

import com.google.gson.annotations.SerializedName

data class CoinCapResponse<T>(
    @SerializedName("data") val data: T,
    @SerializedName("timestamp") val timestamp: Long = 0
)

data class CoinCapAssetDto(
    @SerializedName("id") val id: String,
    @SerializedName("rank") val rank: String?,
    @SerializedName("symbol") val symbol: String,
    @SerializedName("name") val name: String,
    @SerializedName("supply") val supply: String?,
    @SerializedName("maxSupply") val maxSupply: String?,
    @SerializedName("marketCapUsd") val marketCapUsd: String?,
    @SerializedName("volumeUsd24Hr") val volumeUsd24Hr: String?,
    @SerializedName("priceUsd") val priceUsd: String?,
    @SerializedName("changePercent24Hr") val changePercent24Hr: String?
)

data class CoinCapHistoryDto(
    @SerializedName("priceUsd") val priceUsd: String,
    @SerializedName("time") val time: Long
)
