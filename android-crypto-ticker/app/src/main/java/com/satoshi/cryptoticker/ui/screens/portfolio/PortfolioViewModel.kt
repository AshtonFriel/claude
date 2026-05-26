package com.satoshi.cryptoticker.ui.screens.portfolio

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.satoshi.cryptoticker.data.repository.CryptoRepository
import com.satoshi.cryptoticker.data.repository.Result
import com.satoshi.cryptoticker.domain.model.PortfolioEntry
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

data class PortfolioUiState(
    val entries: List<PortfolioEntry> = emptyList(),
    val totalValue: Double = 0.0,
    val totalCost: Double = 0.0,
    val totalPnl: Double = 0.0,
    val isLoading: Boolean = true
)

@HiltViewModel
class PortfolioViewModel @Inject constructor(private val repo: CryptoRepository) : ViewModel() {

    private val _state = MutableStateFlow(PortfolioUiState())
    val state: StateFlow<PortfolioUiState> = _state.asStateFlow()

    init {
        viewModelScope.launch {
            repo.observePortfolio().collect { entities ->
                if (entities.isEmpty()) {
                    _state.update { PortfolioUiState(isLoading = false) }
                    return@collect
                }
                val ids = entities.map { it.coinId }
                val priceMap = when (val result = repo.getCoins(ids)) {
                    is Result.Success -> result.data.associate { it.id to it.currentPrice }
                    is Result.Error -> emptyMap()
                }
                val entries = entities.map { e ->
                    PortfolioEntry(
                        coinId = e.coinId,
                        symbol = e.symbol,
                        name = e.name,
                        holdings = e.holdings,
                        averageBuyPrice = e.averageBuyPrice,
                        currentPrice = priceMap[e.coinId] ?: 0.0
                    )
                }
                _state.update { s ->
                    s.copy(
                        entries = entries,
                        totalValue = entries.sumOf { it.currentValue },
                        totalCost = entries.sumOf { it.costBasis },
                        totalPnl = entries.sumOf { it.pnl },
                        isLoading = false
                    )
                }
            }
        }
    }

    fun upsertEntry(coinId: String, symbol: String, name: String, holdings: Double, avgBuy: Double) {
        viewModelScope.launch { repo.upsertPortfolioEntry(coinId, symbol, name, holdings, avgBuy) }
    }

    fun deleteEntry(coinId: String) {
        viewModelScope.launch { repo.deletePortfolioEntry(coinId) }
    }
}
