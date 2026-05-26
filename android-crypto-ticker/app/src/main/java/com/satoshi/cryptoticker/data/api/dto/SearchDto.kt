package com.satoshi.cryptoticker.data.api.dto

import com.google.gson.annotations.SerializedName

data class SearchResultDto(
    @SerializedName("coins") val coins: List<SearchCoinDto>
)

data class SearchCoinDto(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("symbol") val symbol: String,
    @SerializedName("market_cap_rank") val marketCapRank: Int?,
    @SerializedName("thumb") val thumb: String
)
