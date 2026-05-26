package com.satoshi.cryptoticker.data.api

import com.satoshi.cryptoticker.data.api.dto.CoinDto
import com.satoshi.cryptoticker.data.api.dto.GlobalDto
import com.satoshi.cryptoticker.data.api.dto.MarketChartDto
import com.satoshi.cryptoticker.data.api.dto.SearchResultDto
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

interface CoinGeckoApi {

    @GET("coins/markets")
    suspend fun getMarkets(
        @Query("vs_currency") currency: String = "usd",
        @Query("ids") ids: String,
        @Query("order") order: String = "market_cap_desc",
        @Query("sparkline") sparkline: Boolean = true,
        @Query("price_change_percentage") priceChangePercentage: String = "1h,24h,7d",
        @Query("per_page") perPage: Int = 50,
        @Query("page") page: Int = 1
    ): List<CoinDto>

    @GET("coins/{id}/market_chart")
    suspend fun getMarketChart(
        @Path("id") id: String,
        @Query("vs_currency") currency: String = "usd",
        @Query("days") days: Int
    ): MarketChartDto

    @GET("global")
    suspend fun getGlobal(): GlobalDto

    @GET("search")
    suspend fun search(@Query("query") query: String): SearchResultDto
}
