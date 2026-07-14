package com.satoshi.financetracker.data.db.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

/** One net-worth snapshot per day; same-day refreshes overwrite. */
@Entity(tableName = "snapshots")
data class SnapshotEntity(
    @PrimaryKey val epochDay: Long,
    val totalAssets: Double,
    val totalDebts: Double,
    val netWorth: Double
)
