package com.satoshi.cryptoticker.data.db.dao

import androidx.room.*
import com.satoshi.cryptoticker.data.db.entity.AlertEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface AlertDao {
    @Query("SELECT * FROM alerts WHERE isTriggered = 0 ORDER BY createdAt DESC")
    fun observeActive(): Flow<List<AlertEntity>>

    @Query("SELECT * FROM alerts WHERE coinId = :coinId AND isTriggered = 0")
    suspend fun getActiveForCoin(coinId: String): List<AlertEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(alert: AlertEntity): Long

    @Delete
    suspend fun delete(alert: AlertEntity)

    @Query("UPDATE alerts SET isTriggered = 1 WHERE id = :id")
    suspend fun markTriggered(id: Int)
}
