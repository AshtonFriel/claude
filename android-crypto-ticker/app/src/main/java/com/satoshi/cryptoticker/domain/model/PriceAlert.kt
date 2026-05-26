package com.satoshi.cryptoticker.domain.model

data class PriceAlert(
    val id: Int,
    val coinId: String,
    val coinName: String,
    val targetPrice: Double,
    val isAbove: Boolean
)
