package com.satoshi.cryptoticker.data.api

import com.satoshi.cryptoticker.data.api.dto.LightningStatsDto
import com.satoshi.cryptoticker.data.api.dto.MempoolFeesDto
import retrofit2.http.GET

interface MempoolApi {
    @GET("v1/fees/recommended")
    suspend fun getRecommendedFees(): MempoolFeesDto

    @GET("blocks/tip/height")
    suspend fun getBlockHeight(): Long

    @GET("v1/lightning/statistics/latest")
    suspend fun getLightningStats(): LightningStatsDto
}
