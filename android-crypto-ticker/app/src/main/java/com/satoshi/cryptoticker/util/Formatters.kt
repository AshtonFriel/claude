package com.satoshi.cryptoticker.util

import java.text.NumberFormat
import java.util.Locale
import kotlin.math.abs

private val usdFormat = NumberFormat.getCurrencyInstance(Locale.US)
private val usdCompactFormat = NumberFormat.getCurrencyInstance(Locale.US).apply {
    maximumFractionDigits = 2
}

fun Double.formatPrice(): String = when {
    this >= 1_000 -> usdFormat.format(this).replace(".00", "")
    this >= 1 -> "$${String.format("%.4f", this)}"
    else -> "$${String.format("%.6f", this)}"
}

fun Long.formatLarge(): String = when {
    this >= 1_000_000_000_000L -> "$${String.format("%.2f", this / 1_000_000_000_000.0)}T"
    this >= 1_000_000_000L -> "$${String.format("%.2f", this / 1_000_000_000.0)}B"
    this >= 1_000_000L -> "$${String.format("%.2f", this / 1_000_000.0)}M"
    else -> NumberFormat.getNumberInstance().format(this)
}

fun Double.formatPercent(): String {
    val sign = if (this >= 0) "+" else ""
    return "$sign${String.format("%.2f", this)}%"
}

fun Double.formatSupply(): String = when {
    this >= 1_000_000_000 -> "${String.format("%.2f", this / 1_000_000_000)}B"
    this >= 1_000_000 -> "${String.format("%.2f", this / 1_000_000)}M"
    else -> NumberFormat.getNumberInstance().format(this.toLong())
}

fun Long.formatBlocksToTime(): String {
    val days = this / 144
    val years = days / 365
    val remainingDays = days % 365
    return if (years > 0) "${years}y ${remainingDays}d" else "${days}d"
}
