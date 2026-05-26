package com.satoshi.cryptoticker.data.api.dto

import com.google.gson.annotations.SerializedName

data class GlobalDto(
    @SerializedName("data") val data: GlobalDataDto
)

data class GlobalDataDto(
    @SerializedName("market_cap_percentage") val marketCapPercentage: Map<String, Double>,
    @SerializedName("total_market_cap") val totalMarketCap: Map<String, Double>,
    @SerializedName("total_volume") val totalVolume: Map<String, Double>,
    @SerializedName("active_cryptocurrencies") val activeCryptocurrencies: Int
)
