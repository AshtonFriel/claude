package com.satoshi.cryptoticker.data.db.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "alerts")
data class AlertEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val coinId: String,
    val coinName: String,
    val targetPrice: Double,
    val isAbove: Boolean,
    val isTriggered: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)
