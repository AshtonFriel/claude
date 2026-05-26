package com.satoshi.cryptoticker.data.db.dao

import androidx.room.*
import com.satoshi.cryptoticker.data.db.entity.WatchlistEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface WatchlistDao {
    @Query("SELECT * FROM watchlist ORDER BY sortOrder ASC, addedAt ASC")
    fun observeAll(): Flow<List<WatchlistEntity>>

    @Query("SELECT coinId FROM watchlist")
    suspend fun getAllIds(): List<String>

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insert(entity: WatchlistEntity)

    @Delete
    suspend fun delete(entity: WatchlistEntity)

    @Query("DELETE FROM watchlist WHERE coinId = :coinId")
    suspend fun deleteById(coinId: String)

    @Query("SELECT EXISTS(SELECT 1 FROM watchlist WHERE coinId = :coinId)")
    suspend fun isWatched(coinId: String): Boolean
}
