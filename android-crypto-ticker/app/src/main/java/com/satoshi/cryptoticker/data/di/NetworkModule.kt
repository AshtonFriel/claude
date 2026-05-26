package com.satoshi.cryptoticker.data.di

import com.satoshi.cryptoticker.data.api.CoinGeckoApi
import com.satoshi.cryptoticker.data.api.FearGreedApi
import com.satoshi.cryptoticker.data.api.MempoolApi
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Named
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    private val baseClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BASIC
        })
        .build()

    @Provides
    @Singleton
    fun provideCoinGeckoApi(): CoinGeckoApi =
        Retrofit.Builder()
            .baseUrl("https://api.coingecko.com/api/v3/")
            .client(baseClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(CoinGeckoApi::class.java)

    @Provides
    @Singleton
    fun provideMempoolApi(): MempoolApi =
        Retrofit.Builder()
            .baseUrl("https://mempool.space/api/")
            .client(baseClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(MempoolApi::class.java)

    @Provides
    @Singleton
    fun provideFearGreedApi(): FearGreedApi =
        Retrofit.Builder()
            .baseUrl("https://api.alternative.me/")
            .client(baseClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(FearGreedApi::class.java)
}
