package com.satoshi.cryptoticker.data.di

import android.content.Context
import androidx.room.Room
import com.satoshi.cryptoticker.data.db.AppDatabase
import com.satoshi.cryptoticker.data.db.dao.AlertDao
import com.satoshi.cryptoticker.data.db.dao.PortfolioDao
import com.satoshi.cryptoticker.data.db.dao.WatchlistDao
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
        Room.databaseBuilder(context, AppDatabase::class.java, "crypto_ticker.db").build()

    @Provides fun provideWatchlistDao(db: AppDatabase): WatchlistDao = db.watchlistDao()
    @Provides fun provideAlertDao(db: AppDatabase): AlertDao = db.alertDao()
    @Provides fun providePortfolioDao(db: AppDatabase): PortfolioDao = db.portfolioDao()
}
