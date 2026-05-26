package com.satoshi.cryptoticker.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.satoshi.cryptoticker.R
import com.satoshi.cryptoticker.ui.screens.bitcoin.BitcoinDashboardScreen
import com.satoshi.cryptoticker.ui.screens.dashboard.DashboardScreen
import com.satoshi.cryptoticker.ui.screens.detail.DetailScreen
import com.satoshi.cryptoticker.ui.screens.portfolio.PortfolioScreen
import com.satoshi.cryptoticker.ui.screens.search.SearchScreen
import com.satoshi.cryptoticker.ui.theme.Bitcoin

@Composable
fun NavGraph() {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination

    val bottomItems = listOf(
        Triple(Screen.Bitcoin, Icons.Default.CurrencyBitcoin, "Bitcoin"),
        Triple(Screen.Dashboard, Icons.Default.ShowChart, "Watchlist"),
        Triple(Screen.Search, Icons.Default.Search, "Search"),
        Triple(Screen.Portfolio, Icons.Default.AccountBalanceWallet, "Portfolio")
    )

    val showBottomBar = currentDestination?.route != Screen.Detail.route

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                NavigationBar {
                    bottomItems.forEach { (screen, icon, label) ->
                        val selected = currentDestination?.hierarchy?.any { it.route == screen.route } == true
                        NavigationBarItem(
                            icon = {
                                Icon(
                                    icon, contentDescription = label,
                                    tint = if (selected && screen == Screen.Bitcoin) Bitcoin
                                    else LocalContentColor.current
                                )
                            },
                            label = { Text(label) },
                            selected = selected,
                            onClick = {
                                navController.navigate(screen.route) {
                                    popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Bitcoin.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Bitcoin.route) {
                BitcoinDashboardScreen(onCoinClick = { navController.navigate(Screen.Detail.createRoute(it)) })
            }
            composable(Screen.Dashboard.route) {
                DashboardScreen(onCoinClick = { navController.navigate(Screen.Detail.createRoute(it)) })
            }
            composable(Screen.Search.route) {
                SearchScreen(onCoinClick = { navController.navigate(Screen.Detail.createRoute(it)) })
            }
            composable(Screen.Portfolio.route) {
                PortfolioScreen(onCoinClick = { navController.navigate(Screen.Detail.createRoute(it)) })
            }
            composable(Screen.Detail.route) { backStack ->
                val coinId = backStack.arguments?.getString("coinId") ?: return@composable
                DetailScreen(coinId = coinId, onBack = { navController.popBackStack() })
            }
        }
    }
}
