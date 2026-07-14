package com.satoshi.financetracker.data.repository

import com.satoshi.financetracker.data.api.YahooFinanceApi
import com.satoshi.financetracker.data.db.dao.DebtDao
import com.satoshi.financetracker.data.db.dao.HoldingDao
import com.satoshi.financetracker.data.db.dao.SnapshotDao
import com.satoshi.financetracker.data.db.entity.DebtEntity
import com.satoshi.financetracker.data.db.entity.HoldingEntity
import com.satoshi.financetracker.data.db.entity.SnapshotEntity
import com.satoshi.financetracker.domain.model.Quote
import com.satoshi.financetracker.domain.model.SymbolMatch
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.withContext
import java.time.LocalDate
import javax.inject.Inject
import javax.inject.Singleton

sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val message: String) : Result<Nothing>()
}

private val SEARCHABLE_QUOTE_TYPES = setOf("EQUITY", "ETF", "CRYPTOCURRENCY", "MUTUALFUND", "INDEX")

@Singleton
class FinanceRepository @Inject constructor(
    private val api: YahooFinanceApi,
    private val holdingDao: HoldingDao,
    private val debtDao: DebtDao,
    private val snapshotDao: SnapshotDao
) {
    fun observeHoldings() = holdingDao.observeAll()
    fun observeDebts() = debtDao.observeAll()
    fun observeSnapshots() = snapshotDao.observeAll()

    /**
     * Fetches live quotes for the given symbols, one chart call per symbol in parallel.
     * Symbols that fail individually are simply missing from the map; only a total
     * failure (nothing fetched for a non-empty request) is an Error.
     */
    suspend fun getQuotes(symbols: List<String>): Result<Map<String, Quote>> =
        withContext(Dispatchers.IO) {
            val distinct = symbols.distinct()
            if (distinct.isEmpty()) return@withContext Result.Success(emptyMap())
            val quotes = coroutineScope {
                distinct.map { symbol ->
                    async {
                        runCatching {
                            val meta = api.getChart(symbol).chart?.result?.firstOrNull()?.meta
                            meta?.regularMarketPrice?.let { price ->
                                symbol to Quote(price, meta.chartPreviousClose)
                            }
                        }.getOrNull()
                    }
                }.awaitAll().filterNotNull().toMap()
            }
            if (quotes.isEmpty()) Result.Error("Couldn't fetch prices — check your connection")
            else Result.Success(quotes)
        }

    suspend fun searchSymbols(query: String): Result<List<SymbolMatch>> =
        withContext(Dispatchers.IO) {
            runCatching {
                api.search(query).quotes.orEmpty().mapNotNull { q ->
                    val symbol = q.symbol ?: return@mapNotNull null
                    val type = q.quoteType ?: return@mapNotNull null
                    if (type !in SEARCHABLE_QUOTE_TYPES) return@mapNotNull null
                    SymbolMatch(
                        symbol = symbol,
                        name = q.longname ?: q.shortname ?: symbol,
                        quoteType = type,
                        exchange = q.exchDisp
                    )
                }
            }.fold(
                onSuccess = { Result.Success(it) },
                onFailure = { Result.Error(it.message ?: "Search failed") }
            )
        }

    // Holdings
    suspend fun upsertHolding(entity: HoldingEntity) = holdingDao.upsert(entity)
    suspend fun deleteHolding(id: Long) = holdingDao.deleteById(id)

    // Debts
    suspend fun upsertDebt(entity: DebtEntity) = debtDao.upsert(entity)
    suspend fun deleteDebt(id: Long) = debtDao.deleteById(id)

    /** Records today's net-worth snapshot, overwriting any earlier one from today. */
    suspend fun recordSnapshot(totalAssets: Double, totalDebts: Double) =
        snapshotDao.upsert(
            SnapshotEntity(
                epochDay = LocalDate.now().toEpochDay(),
                totalAssets = totalAssets,
                totalDebts = totalDebts,
                netWorth = totalAssets - totalDebts
            )
        )
}
