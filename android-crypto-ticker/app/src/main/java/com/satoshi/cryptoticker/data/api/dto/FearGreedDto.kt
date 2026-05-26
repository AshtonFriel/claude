package com.satoshi.cryptoticker.data.api.dto

import com.google.gson.annotations.SerializedName

data class FearGreedDto(
    @SerializedName("data") val data: List<FearGreedEntryDto>
)

data class FearGreedEntryDto(
    @SerializedName("value") val value: String,
    @SerializedName("value_classification") val classification: String,
    @SerializedName("timestamp") val timestamp: String
)
