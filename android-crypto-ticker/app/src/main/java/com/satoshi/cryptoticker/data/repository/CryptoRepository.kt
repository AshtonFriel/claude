package com.satoshi.cryptoticker.data.repository

import com.satoshi.cryptoticker.data.api.CoinCapApi
import com.satoshi.cryptoticker.data.api.FearGreedApi
import com.satoshi.cryptoticker.data.api.MempoolApi
import com.satoshi.cryptoticker.data.db.dao.AlertDao
import com.satoshi.cryptoticker.data.db.dao.PortfolioDao
import com.satoshi.cryptoticker.data.db.dao.WatchlistDao
import com.satoshi.cryptoticker.data.db.entity.AlertEntity
import com.satoshi.cryptoticker.data.db.entity.PortfolioEntity
import com.satoshi.cryptoticker.data.db.entity.WatchlistEntity
import com.satoshi.cryptoticker.domain.model.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val message: String, val isRateLimit: Boolean = false) : Result<Nothing>()
}

@Singleton
class CryptoRepository @Inject constructor(
    private val coinCapApi: CoinCapApi,
    private val mempoolApi: MempoolApi,
    private val fearGreedApi: FearGreedApi,
    private val watchlistDao: WatchlistDao,
    private val alertDao: AlertDao,
    private val portfolioDao: PortfolioDao
) {
    private val defaultCoins = listOf("bitcoin", "ethereum", "solana", "litecoin", "monero")

    val watchlistIds = watchlistDao.observeAll().map { it.map { e -> e.coinId } }

    private suspend fun <T> withRateLimitRetry(block: suspend () -> T): T {
        var delayMs = 2000L
        var lastException: Exception? = null
        repeat(3) { attempt ->
            try {
                return block()
            } catch (e: Exception) {
                lastException = e
                if (e.message?.contains("429") == true && attempt < 2) {
                    delay(delayMs)
                    delayMs *= 2
                } else {
                    throw e
                }
            }
        }
        throw lastException!!
    }

    suspend fun getCoins(ids: List<String>): Result<List<Coin>> = withContext(Dispatchers.IO) {
        runCatching {
            val allIds = (listOf("bitcoin") + ids).distinct()
            val watchedIds = watchlistDao.getAllIds().toSet()
            withRateLimitRetry { coinCapApi.getAssets(ids = allIds.joinToString(",")) }
                .data
                .sortedWith(compareBy({ if (it.id == "bitcoin") 0 else 1 }, { it.rank?.toIntOrNull() ?: Int.MAX_VALUE }))
                .map { dto ->
                    Coin(
                        id = dto.id,
                        symbol = dto.symbol,
                        name = dto.name,
                        imageUrl = "https://assets.coincap.io/assets/icons/${dto.symbol.lowercase()}@2x.png",
                        currentPrice = dto.priceUsd?.toDoubleOrNull() ?: 0.0,
                        marketCap = dto.marketCapUsd?.toDoubleOrNull()?.toLong() ?: 0L,
                        marketCapRank = dto.rank?.toIntOrNull() ?: 0,
                        totalVolume = dto.volumeUsd24Hr?.toDoubleOrNull()?.toLong() ?: 0L,
                        priceChangePercent1h = 0.0,
                        priceChangePercent24h = dto.changePercent24Hr?.toDoubleOrNull() ?: 0.0,
                        priceChangePercent7d = 0.0,
                        circulatingSupply = dto.supply?.toDoubleOrNull() ?: 0.0,
                        maxSupply = dto.maxSupply?.toDoubleOrNull(),
                        ath = 0.0,
                        atl = 0.0,
                        sparklinePrices = emptyList(),
                        isWatched = dto.id in watchedIds
                    )
                }
        }.fold(
            onSuccess = { Result.Success(it) },
            onFailure = { e ->
                Result.Error(e.message ?: "Unknown error", e.message?.contains("429") == true)
            }
        )
    }

    suspend fun getMarketChart(coinId: String, days: Int): Result<List<Pair<Long, Double>>> =
        withContext(Dispatchers.IO) {
            runCatching {
                val end = System.currentTimeMillis()
                val start = end - days.toLong() * 24 * 60 * 60 * 1000
                val interval = when {
                    days <= 7 -> "h1"
                    days <= 30 -> "h6"
                    else -> "d1"
                }
                withRateLimitRetry {
                    coinCapApi.getHistory(coinId, interval = interval, start = start, end = end)
                }.data.map { it.time to (it.priceUsd.toDoubleOrNull() ?: 0.0) }
            }.fold(
                onSuccess = { Result.Success(it) },
                onFailure = { Result.Error(it.message ?: "Chart error") }
            )
        }

    suspend fun getBitcoinStats(): Result<BitcoinStats> = withContext(Dispatchers.IO) {
        runCatching {
            val blockHeight = mempoolApi.getBlockHeight()
            val halvingInterval = 210_000L
            val nextHalving = ((blockHeight / halvingInterval) + 1) * halvingInterval
            val blocksUntilHalving = nextHalving - blockHeight

            val fees = runCatching {
                val f = mempoolApi.getRecommendedFees()
                MempoolFees(f.fastestFee, f.halfHourFee, f.hourFee, f.economyFee)
            }.getOrNull()

            val lightning = runCatching {
                val l = mempoolApi.getLightningStats().latest
                LightningStats(l.channelCount, l.nodeCount, l.totalCapacitySat / 100_000_000.0, l.avgCapacitySat)
            }.getOrNull()

            val fearGreed = runCatching {
                val fg = fearGreedApi.getFearGreedIndex().data.firstOrNull()
                fg?.let { FearGreedIndex(it.value.toInt(), it.classification) }
            }.getOrNull()

            BitcoinStats(
                dominancePercent = null,
                blockHeight = blockHeight,
                blocksUntilHalving = blocksUntilHalving,
                estimatedHalvingDays = blocksUntilHalving / 144,
                fees = fees,
                lightning = lightning,
                fearGreed = fearGreed
            )
        }.fold(
            onSuccess = { Result.Success(it) },
            onFailure = { Result.Error(it.message ?: "Stats error") }
        )
    }

    suspend fun searchCoins(query: String): Result<List<SearchCoin>> = withContext(Dispatchers.IO) {
        runCatching {
            coinCapApi.searchAssets(query).data.map {
                SearchCoin(
                    id = it.id,
                    name = it.name,
                    symbol = it.symbol,
                    marketCapRank = it.rank?.toIntOrNull(),
                    thumbUrl = "https://assets.coincap.io/assets/icons/${it.symbol.lowercase()}@2x.png"
                )
            }
        }.fold(
            onSuccess = { Result.Success(it) },
            onFailure = { Result.Error(it.message ?: "Search error") }
        )
    }

    // Watchlist
    suspend fun addToWatchlist(coinId: String, symbol: String, name: String) =
        watchlistDao.insert(WatchlistEntity(coinId, symbol, name))

    suspend fun removeFromWatchlist(coinId: String) = watchlistDao.deleteById(coinId)

    suspend fun isWatched(coinId: String) = watchlistDao.isWatched(coinId)

    fun observeWatchlist() = watchlistDao.observeAll()

    // Alerts
    fun observeAlerts() = alertDao.observeActive()

    suspend fun addAlert(coinId: String, coinName: String, targetPrice: Double, isAbove: Boolean) =
        alertDao.insert(AlertEntity(coinId = coinId, coinName = coinName, targetPrice = targetPrice, isAbove = isAbove))

    suspend fun deleteAlert(alert: AlertEntity) = alertDao.delete(alert)

    suspend fun checkAndTriggerAlerts(prices: Map<String, Double>): List<AlertEntity> {
        val triggered = mutableListOf<AlertEntity>()
        prices.forEach { (coinId, price) ->
            alertDao.getActiveForCoin(coinId).forEach { alert ->
                val hit = if (alert.isAbove) price >= alert.targetPrice else price <= alert.targetPrice
                if (hit) {
                    alertDao.markTriggered(alert.id)
                    triggered.add(alert)
                }
            }
        }
        return triggered
    }

    // Portfolio
    fun observePortfolio() = portfolioDao.observeAll()

    suspend fun upsertPortfolioEntry(coinId: String, symbol: String, name: String, holdings: Double, avgBuy: Double) =
        portfolioDao.upsert(PortfolioEntity(coinId, symbol, name, holdings, avgBuy))

    suspend fun deletePortfolioEntry(coinId: String) = portfolioDao.deleteById(coinId)
}

data class SearchCoin(
    val id: String,
    val name: String,
    val symbol: String,
    val marketCapRank: Int?,
    val thumbUrl: String
)
