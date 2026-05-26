package com.satoshi.cryptoticker.data.db.dao

import androidx.room.*
import com.satoshi.cryptoticker.data.db.entity.PortfolioEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface PortfolioDao {
    @Query("SELECT * FROM portfolio ORDER BY coinId ASC")
    fun observeAll(): Flow<List<PortfolioEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(entry: PortfolioEntity)

    @Delete
    suspend fun delete(entry: PortfolioEntity)

    @Query("DELETE FROM portfolio WHERE coinId = :coinId")
    suspend fun deleteById(coinId: String)
}
