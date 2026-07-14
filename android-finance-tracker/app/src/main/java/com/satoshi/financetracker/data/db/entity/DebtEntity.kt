package com.satoshi.financetracker.data.db.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.satoshi.financetracker.domain.model.DebtCategory

@Entity(tableName = "debts")
data class DebtEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val category: DebtCategory,
    val balance: Double,
    val aprPercent: Double,
    val minimumPayment: Double
)
