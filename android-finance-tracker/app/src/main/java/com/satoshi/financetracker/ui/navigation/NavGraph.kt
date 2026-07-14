package com.satoshi.financetracker.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ShowChart
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.CreditCard
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.satoshi.financetracker.ui.screens.dashboard.DashboardScreen
import com.satoshi.financetracker.ui.screens.debts.DebtsScreen
import com.satoshi.financetracker.ui.screens.investments.InvestmentsScreen
import com.satoshi.financetracker.ui.screens.payoff.PayoffScreen

@Composable
fun NavGraph() {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination

    val bottomItems = listOf(
        Triple(Screen.Dashboard, Icons.Default.Dashboard, "Overview"),
        Triple(Screen.Investments, Icons.AutoMirrored.Filled.ShowChart, "Invest"),
        Triple(Screen.Debts, Icons.Default.CreditCard, "Debts"),
        Triple(Screen.Payoff, Icons.Default.Calculate, "Payoff")
    )

    Scaffold(
        bottomBar = {
            NavigationBar {
                bottomItems.forEach { (screen, icon, label) ->
                    val selected = currentDestination?.hierarchy?.any { it.route == screen.route } == true
                    NavigationBarItem(
                        icon = { Icon(icon, contentDescription = label) },
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
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Dashboard.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Dashboard.route) { DashboardScreen() }
            composable(Screen.Investments.route) { InvestmentsScreen() }
            composable(Screen.Debts.route) { DebtsScreen() }
            composable(Screen.Payoff.route) { PayoffScreen() }
        }
    }
}
