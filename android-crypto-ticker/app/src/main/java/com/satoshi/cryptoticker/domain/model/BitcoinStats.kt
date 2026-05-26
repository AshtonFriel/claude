package com.satoshi.cryptoticker.domain.model

data class BitcoinStats(
    val dominancePercent: Double,
    val blockHeight: Long,
    val blocksUntilHalving: Long,
    val estimatedHalvingDays: Long,
    val fees: MempoolFees?,
    val lightning: LightningStats?,
    val fearGreed: FearGreedIndex?
)

data class MempoolFees(
    val fastest: Int,
    val halfHour: Int,
    val hour: Int,
    val economy: Int
)

data class LightningStats(
    val channelCount: Int,
    val nodeCount: Int,
    val totalCapacityBtc: Double,
    val avgCapacitySat: Long
)

data class FearGreedIndex(
    val value: Int,
    val classification: String
)
