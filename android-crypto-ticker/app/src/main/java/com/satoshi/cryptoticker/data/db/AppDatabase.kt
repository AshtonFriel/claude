package com.satoshi.cryptoticker.data.db

import androidx.room.Database
import androidx.room.RoomDatabase
import com.satoshi.cryptoticker.data.db.dao.AlertDao
import com.satoshi.cryptoticker.data.db.dao.PortfolioDao
import com.satoshi.cryptoticker.data.db.dao.WatchlistDao
import com.satoshi.cryptoticker.data.db.entity.AlertEntity
import com.satoshi.cryptoticker.data.db.entity.PortfolioEntity
import com.satoshi.cryptoticker.data.db.entity.WatchlistEntity

@Database(
    entities = [WatchlistEntity::class, AlertEntity::class, PortfolioEntity::class],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun watchlistDao(): WatchlistDao
    abstract fun alertDao(): AlertDao
    abstract fun portfolioDao(): PortfolioDao
}
