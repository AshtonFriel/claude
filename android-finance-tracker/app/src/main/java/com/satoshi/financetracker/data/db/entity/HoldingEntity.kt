package com.satoshi.financetracker.data.db.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.satoshi.financetracker.domain.model.HoldingType

@Entity(tableName = "holdings")
data class HoldingEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val type: HoldingType,
    /** Yahoo Finance quote symbol, e.g. "AAPL" or "BTC-USD". Null for manually valued assets. */
    val quoteSymbol: String?,
    /** Units held. Fixed at 1.0 for manual assets. */
    val quantity: Double,
    /** Average cost per unit (total cost for manual assets). Null = no cost basis tracked. */
    val avgCostPerUnit: Double?,
    /** Current value entered by hand. Only used when quoteSymbol is null. */
    val manualValue: Double?
)
