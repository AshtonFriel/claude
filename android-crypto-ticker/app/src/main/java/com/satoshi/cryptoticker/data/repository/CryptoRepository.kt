package com.satoshi.cryptoticker.data.repository

import com.satoshi.cryptoticker.data.api.CoinGeckoApi
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
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val message: String, val isRateLimit: Boolean = false) : Result<Nothing>()
}

@Singleton
class CryptoRepository @Inject constructor(
    private val coinGeckoApi: CoinGeckoApi,
    private val mempoolApi: MempoolApi,
    private val fearGreedApi: FearGreedApi,
    private val watchlistDao: WatchlistDao,
    private val alertDao: AlertDao,
    private val portfolioDao: PortfolioDao
) {
    private val defaultCoins = listOf("bitcoin", "ethereum", "solana", "litecoin", "monero")

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

    val watchlistIds: Flow<List<String>> = watchlistDao.observeAll()
        .map { entities -> entities.map { it.coinId } }

    suspend fun getCoins(ids: List<String>): Result<List<Coin>> = withContext(Dispatchers.IO) {
        runCatching {
            val allIds = (listOf("bitcoin") + ids).distinct()
            val watchedIds = watchlistDao.getAllIds().toSet()
            withRateLimitRetry { coinGeckoApi.getMarkets(ids = allIds.joinToString(",")) }
                .sortedWith(compareBy({ if (it.id == "bitcoin") 0 else 1 }, { it.marketCapRank }))
                .map { dto ->
                    Coin(
                        id = dto.id,
                        symbol = dto.symbol,
                        name = dto.name,
                        imageUrl = dto.image,
                        currentPrice = dto.currentPrice,
                        marketCap = dto.marketCap,
                        marketCapRank = dto.marketCapRank,
                        totalVolume = dto.totalVolume,
                        priceChangePercent1h = dto.priceChangePercentage1h ?: 0.0,
                        priceChangePercent24h = dto.priceChangePercentage24h ?: 0.0,
                        priceChangePercent7d = dto.priceChangePercentage7d ?: 0.0,
                        circulatingSupply = dto.circulatingSupply ?: 0.0,
                        maxSupply = dto.maxSupply,
                        ath = dto.ath ?: 0.0,
                        atl = dto.atl ?: 0.0,
                        sparklinePrices = dto.sparkline?.price ?: emptyList(),
                        isWatched = dto.id in watchedIds
                    )
                }
        }.fold(
            onSuccess = { Result.Success(it) },
            onFailure = { e ->
                val isRate = e.message?.contains("429") == true
                Result.Error(e.message ?: "Unknown error", isRate)
            }
        )
    }

    suspend fun getMarketChart(coinId: String, days: Int): Result<List<Pair<Long, Double>>> =
        withContext(Dispatchers.IO) {
            runCatching {
                withRateLimitRetry { coinGeckoApi.getMarketChart(coinId, days = days) }
                    .prices.map { it[0].toLong() to it[1] }
            }.fold(
                onSuccess = { Result.Success(it) },
                onFailure = { Result.Error(it.message ?: "Chart error") }
            )
        }

    suspend fun getBitcoinStats(): Result<BitcoinStats> = withContext(Dispatchers.IO) {
        runCatching {
            val global = coinGeckoApi.getGlobal()
            val dominance = global.data.marketCapPercentage["btc"] ?: 0.0
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
                dominancePercent = dominance,
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
            coinGeckoApi.search(query).coins.map {
                SearchCoin(it.id, it.name, it.symbol, it.marketCapRank, it.thumb)
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
            val alerts = alertDao.getActiveForCoin(coinId)
            alerts.forEach { alert ->
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
