package com.satoshi.financetracker.data.db.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.satoshi.financetracker.data.db.entity.HoldingEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface HoldingDao {
    @Query("SELECT * FROM holdings ORDER BY name COLLATE NOCASE")
    fun observeAll(): Flow<List<HoldingEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(entity: HoldingEntity)

    @Query("DELETE FROM holdings WHERE id = :id")
    suspend fun deleteById(id: Long)
}
