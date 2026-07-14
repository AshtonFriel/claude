package com.satoshi.financetracker.data.di

import android.content.Context
import androidx.room.Room
import com.satoshi.financetracker.data.db.AppDatabase
import com.satoshi.financetracker.data.db.dao.DebtDao
import com.satoshi.financetracker.data.db.dao.HoldingDao
import com.satoshi.financetracker.data.db.dao.SnapshotDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): AppDatabase =
        Room.databaseBuilder(context, AppDatabase::class.java, "finance_tracker.db").build()

    @Provides fun provideHoldingDao(db: AppDatabase): HoldingDao = db.holdingDao()
    @Provides fun provideDebtDao(db: AppDatabase): DebtDao = db.debtDao()
    @Provides fun provideSnapshotDao(db: AppDatabase): SnapshotDao = db.snapshotDao()
}
