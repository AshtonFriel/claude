package com.satoshi.cryptoticker.data.api

import com.satoshi.cryptoticker.data.api.dto.FearGreedDto
import retrofit2.http.GET
import retrofit2.http.Query

interface FearGreedApi {
    @GET("fng/")
    suspend fun getFearGreedIndex(@Query("limit") limit: Int = 1): FearGreedDto
}
