package com.satoshi.financetracker.ui.navigation

sealed class Screen(val route: String) {
    data object Dashboard : Screen("dashboard")
    data object Investments : Screen("investments")
    data object Debts : Screen("debts")
    data object Payoff : Screen("payoff")
}
