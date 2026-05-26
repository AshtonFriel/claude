package com.satoshi.cryptoticker.ui.screens.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.satoshi.cryptoticker.data.repository.CryptoRepository
import com.satoshi.cryptoticker.data.repository.Result
import com.satoshi.cryptoticker.domain.model.Coin
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

data class DashboardUiState(
    val coins: List<Coin> = emptyList(),
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: String? = null,
    val isRateLimit: Boolean = false
)

@HiltViewModel
class DashboardViewModel @Inject constructor(private val repo: CryptoRepository) : ViewModel() {

    private val _state = MutableStateFlow(DashboardUiState())
    val state: StateFlow<DashboardUiState> = _state.asStateFlow()

    init {
        observeWatchlist()
        startAutoRefresh()
    }

    private fun observeWatchlist() {
        viewModelScope.launch {
            repo.watchlistIds.collect { ids -> loadCoins(ids) }
        }
    }

    fun refresh() {
        viewModelScope.launch {
            _state.update { it.copy(isRefreshing = true) }
            loadCoins(repo.watchlistIds.first())
            _state.update { it.copy(isRefreshing = false) }
        }
    }

    private suspend fun loadCoins(ids: List<String>) {
        val allIds = (listOf("bitcoin", "ethereum", "solana", "litecoin", "monero") + ids).distinct()
        val result = repo.getCoins(allIds)
        _state.update { s ->
            when (result) {
                is Result.Success -> s.copy(coins = result.data, isLoading = false, error = null)
                is Result.Error -> s.copy(isLoading = false, error = result.message, isRateLimit = result.isRateLimit)
            }
        }
    }

    suspend fun toggleWatchlist(coin: Coin) {
        if (coin.isWatched) repo.removeFromWatchlist(coin.id)
        else repo.addToWatchlist(coin.id, coin.symbol, coin.name)
    }

    private fun startAutoRefresh() {
        viewModelScope.launch {
            while (true) {
                delay(30_000)
                val ids = runCatching { repo.watchlistIds.first() }.getOrDefault(emptyList())
                loadCoins(ids)
            }
        }
    }
}
