package com.satoshi.financetracker.data.api

import com.satoshi.financetracker.data.api.dto.YahooChartResponse
import com.satoshi.financetracker.data.api.dto.YahooSearchResponse
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

interface YahooFinanceApi {

    @GET("v8/finance/chart/{symbol}")
    suspend fun getChart(
        @Path("symbol") symbol: String,
        @Query("range") range: String = "1d",
        @Query("interval") interval: String = "1d"
    ): YahooChartResponse

    @GET("v1/finance/search")
    suspend fun search(
        @Query("q") query: String,
        @Query("quotesCount") quotesCount: Int = 10,
        @Query("newsCount") newsCount: Int = 0
    ): YahooSearchResponse
}
