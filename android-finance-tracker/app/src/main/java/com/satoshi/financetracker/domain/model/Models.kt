package com.satoshi.financetracker.domain.model

enum class HoldingType(val label: String) {
    STOCK("Stocks & ETFs"),
    CRYPTO("Crypto"),
    MANUAL("Other assets")
}

enum class DebtCategory(val label: String) {
    CREDIT_CARD("Credit card"),
    MORTGAGE("Mortgage"),
    AUTO("Auto loan"),
    STUDENT("Student loan"),
    PERSONAL("Personal loan"),
    OTHER("Other")
}

/** Live quote for one symbol. */
data class Quote(
    val price: Double,
    val previousClose: Double?
)

/** A holding joined with its live quote (if any). */
data class Holding(
    val id: Long,
    val name: String,
    val type: HoldingType,
    val quoteSymbol: String?,
    val quantity: Double,
    val avgCostPerUnit: Double?,
    val manualValue: Double?,
    val currentPrice: Double?,
    val previousClose: Double?
) {
    val currentValue: Double
        get() = when {
            quoteSymbol == null -> manualValue ?: 0.0
            else -> quantity * (currentPrice ?: avgCostPerUnit ?: 0.0)
        }

    val costBasis: Double?
        get() = avgCostPerUnit?.let { it * quantity }

    val gainLoss: Double?
        get() = costBasis?.let { currentValue - it }

    val gainLossPercent: Double?
        get() = costBasis?.takeIf { it > 0 }?.let { (currentValue - it) / it * 100 }

    val dayChangePercent: Double?
        get() {
            val price = currentPrice ?: return null
            val prev = previousClose?.takeIf { it > 0 } ?: return null
            return (price - prev) / prev * 100
        }

    /** True when a live price was expected but couldn't be fetched. */
    val isStale: Boolean
        get() = quoteSymbol != null && currentPrice == null
}

data class Debt(
    val id: Long,
    val name: String,
    val category: DebtCategory,
    val balance: Double,
    val aprPercent: Double,
    val minimumPayment: Double
)

/** Symbol search result from Yahoo Finance. */
data class SymbolMatch(
    val symbol: String,
    val name: String,
    val quoteType: String,
    val exchange: String?
) {
    val isCrypto: Boolean get() = quoteType == "CRYPTOCURRENCY"
}
