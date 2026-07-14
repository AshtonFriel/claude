package com.satoshi.financetracker.data.db

import androidx.room.Database
import androidx.room.RoomDatabase
import com.satoshi.financetracker.data.db.dao.DebtDao
import com.satoshi.financetracker.data.db.dao.HoldingDao
import com.satoshi.financetracker.data.db.dao.SnapshotDao
import com.satoshi.financetracker.data.db.entity.DebtEntity
import com.satoshi.financetracker.data.db.entity.HoldingEntity
import com.satoshi.financetracker.data.db.entity.SnapshotEntity

@Database(
    entities = [HoldingEntity::class, DebtEntity::class, SnapshotEntity::class],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun holdingDao(): HoldingDao
    abstract fun debtDao(): DebtDao
    abstract fun snapshotDao(): SnapshotDao
}
