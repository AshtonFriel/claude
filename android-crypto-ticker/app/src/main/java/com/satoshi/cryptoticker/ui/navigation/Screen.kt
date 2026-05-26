package com.satoshi.cryptoticker.ui.navigation

sealed class Screen(val route: String) {
    object Dashboard : Screen("dashboard")
    object Bitcoin : Screen("bitcoin")
    object Search : Screen("search")
    object Portfolio : Screen("portfolio")
    object Detail : Screen("detail/{coinId}") {
        fun createRoute(coinId: String) = "detail/$coinId"
    }
}
