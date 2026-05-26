package com.satoshi.cryptoticker.data.db.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "portfolio")
data class PortfolioEntity(
    @PrimaryKey val coinId: String,
    val symbol: String,
    val name: String,
    val holdings: Double,
    val averageBuyPrice: Double,
    val updatedAt: Long = System.currentTimeMillis()
)
