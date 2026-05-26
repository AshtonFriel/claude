package com.satoshi.cryptoticker.domain.model

data class PortfolioEntry(
    val coinId: String,
    val symbol: String,
    val name: String,
    val holdings: Double,
    val averageBuyPrice: Double,
    val currentPrice: Double = 0.0
) {
    val currentValue: Double get() = holdings * currentPrice
    val costBasis: Double get() = holdings * averageBuyPrice
    val pnl: Double get() = currentValue - costBasis
    val pnlPercent: Double get() = if (costBasis > 0) (pnl / costBasis) * 100 else 0.0
}
