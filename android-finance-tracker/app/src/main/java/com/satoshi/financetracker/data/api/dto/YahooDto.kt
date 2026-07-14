package com.satoshi.financetracker.data.api.dto

data class YahooChartResponse(val chart: YahooChart?)

data class YahooChart(
    val result: List<YahooChartResult>?,
    val error: YahooError?
)

data class YahooChartResult(val meta: YahooMeta?)

data class YahooMeta(
    val symbol: String?,
    val currency: String?,
    val regularMarketPrice: Double?,
    val chartPreviousClose: Double?,
    val shortName: String?,
    val longName: String?
)

data class YahooError(val code: String?, val description: String?)

data class YahooSearchResponse(val quotes: List<YahooSearchQuote>?)

data class YahooSearchQuote(
    val symbol: String?,
    val shortname: String?,
    val longname: String?,
    val quoteType: String?,
    val exchDisp: String?
)
