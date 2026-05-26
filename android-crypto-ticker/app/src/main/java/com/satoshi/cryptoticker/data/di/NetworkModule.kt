package com.satoshi.cryptoticker.data.di

import android.content.Context
import com.satoshi.cryptoticker.BuildConfig
import com.satoshi.cryptoticker.data.api.CoinCapApi
import com.satoshi.cryptoticker.data.api.FearGreedApi
import com.satoshi.cryptoticker.data.api.MempoolApi
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import okhttp3.Cache
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.io.File
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideOkHttpClient(@ApplicationContext context: Context): OkHttpClient {
        val cache = Cache(File(context.cacheDir, "http"), 10 * 1024 * 1024)
        return OkHttpClient.Builder()
            .cache(cache)
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(15, TimeUnit.SECONDS)
            .apply {
                if (BuildConfig.DEBUG) {
                    addInterceptor(HttpLoggingInterceptor().apply {
                        level = HttpLoggingInterceptor.Level.BASIC
                    })
                }
            }
            .build()
    }

    @Provides
    @Singleton
    fun provideCoinCapApi(client: OkHttpClient): CoinCapApi =
        Retrofit.Builder()
            .baseUrl("https://api.coincap.io/v2/")
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(CoinCapApi::class.java)

    @Provides
    @Singleton
    fun provideMempoolApi(client: OkHttpClient): MempoolApi =
        Retrofit.Builder()
            .baseUrl("https://mempool.space/api/")
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(MempoolApi::class.java)

    @Provides
    @Singleton
    fun provideFearGreedApi(client: OkHttpClient): FearGreedApi =
        Retrofit.Builder()
            .baseUrl("https://api.alternative.me/")
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(FearGreedApi::class.java)
}
