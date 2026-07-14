package com.satoshi.financetracker.data.db.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.satoshi.financetracker.data.db.entity.SnapshotEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface SnapshotDao {
    @Query("SELECT * FROM snapshots ORDER BY epochDay")
    fun observeAll(): Flow<List<SnapshotEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(entity: SnapshotEntity)
}
