package com.satoshi.cryptoticker.data.api

import com.satoshi.cryptoticker.data.api.dto.CoinCapAssetDto
import com.satoshi.cryptoticker.data.api.dto.CoinCapHistoryDto
import com.satoshi.cryptoticker.data.api.dto.CoinCapResponse
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

interface CoinCapApi {

    @GET("assets")
    suspend fun getAssets(
        @Query("ids") ids: String,
        @Query("limit") limit: Int = 50
    ): CoinCapResponse<List<CoinCapAssetDto>>

    @GET("assets")
    suspend fun searchAssets(
        @Query("search") query: String,
        @Query("limit") limit: Int = 20
    ): CoinCapResponse<List<CoinCapAssetDto>>

    @GET("assets/{id}/history")
    suspend fun getHistory(
        @Path("id") id: String,
        @Query("interval") interval: String,
        @Query("start") start: Long,
        @Query("end") end: Long
    ): CoinCapResponse<List<CoinCapHistoryDto>>
}
