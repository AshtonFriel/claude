package com.satoshi.financetracker.util

import java.text.NumberFormat
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale
import kotlin.math.abs

private val usdFormat = NumberFormat.getCurrencyInstance(Locale.US)

/** "$12,345" for large amounts, "$123.45" below $1,000. */
fun Double.formatMoney(): String {
    val value = this
    return if (abs(value) >= 1_000) {
        val whole = NumberFormat.getNumberInstance(Locale.US).format(Math.round(value))
        "$$whole".replace("$-", "-$")
    } else {
        usdFormat.format(value).replace("($", "-$").removeSuffix(")")
    }
}

/** Always shows cents, e.g. "$1,234.56". */
fun Double.formatMoneyExact(): String =
    usdFormat.format(this).replace("($", "-$").removeSuffix(")")

/** Signed form for gains/losses, e.g. "+$523" / "-$1,020". */
fun Double.formatMoneySigned(): String =
    (if (this >= 0) "+" else "") + formatMoney()

fun Double.formatPercent(): String {
    val sign = if (this >= 0) "+" else ""
    return "$sign${String.format(Locale.US, "%.2f", this)}%"
}

/** "8mo", "2y 3mo". */
fun Int.formatMonths(): String {
    val years = this / 12
    val months = this % 12
    return when {
        years > 0 && months > 0 -> "${years}y ${months}mo"
        years > 0 -> "${years}y"
        else -> "${months}mo"
    }
}

/** Calendar month a payoff lands in, e.g. "Mar 2029". */
fun Int.monthsFromNowLabel(): String =
    LocalDate.now().plusMonths(this.toLong())
        .format(DateTimeFormatter.ofPattern("MMM yyyy", Locale.US))

fun Long.epochDayLabel(): String =
    LocalDate.ofEpochDay(this).format(DateTimeFormatter.ofPattern("MMM d", Locale.US))
