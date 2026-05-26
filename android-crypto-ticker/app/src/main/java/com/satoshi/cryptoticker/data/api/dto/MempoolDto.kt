package com.satoshi.cryptoticker.data.api.dto

import com.google.gson.annotations.SerializedName

data class MempoolFeesDto(
    @SerializedName("fastestFee") val fastestFee: Int,
    @SerializedName("halfHourFee") val halfHourFee: Int,
    @SerializedName("hourFee") val hourFee: Int,
    @SerializedName("economyFee") val economyFee: Int,
    @SerializedName("minimumFee") val minimumFee: Int
)

data class LightningStatsDto(
    @SerializedName("latest") val latest: LightningLatestDto
)

data class LightningLatestDto(
    @SerializedName("channel_count") val channelCount: Int,
    @SerializedName("node_count") val nodeCount: Int,
    @SerializedName("total_capacity") val totalCapacitySat: Long,
    @SerializedName("avg_capacity") val avgCapacitySat: Long,
    @SerializedName("avg_fee_rate") val avgFeeRate: Int,
    @SerializedName("avg_base_fee_mtokens") val avgBaseFeeMTokens: Long,
    @SerializedName("med_capacity") val medCapacitySat: Long
)
