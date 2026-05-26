package com.satoshi.cryptoticker.data.db.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "watchlist")
data class WatchlistEntity(
    @PrimaryKey val coinId: String,
    val symbol: String,
    val name: String,
    val addedAt: Long = System.currentTimeMillis(),
    val sortOrder: Int = 0
)
