package com.satoshi.financetracker.domain.model

import com.satoshi.financetracker.data.db.entity.DebtEntity
import com.satoshi.financetracker.data.db.entity.HoldingEntity

fun HoldingEntity.toHolding(quotes: Map<String, Quote>): Holding {
    val quote = quoteSymbol?.let { quotes[it] }
    return Holding(
        id = id,
        name = name,
        type = type,
        quoteSymbol = quoteSymbol,
        quantity = quantity,
        avgCostPerUnit = avgCostPerUnit,
        manualValue = manualValue,
        currentPrice = quote?.price,
        previousClose = quote?.previousClose
    )
}

fun DebtEntity.toDebt() = Debt(
    id = id,
    name = name,
    category = category,
    balance = balance,
    aprPercent = aprPercent,
    minimumPayment = minimumPayment
)
