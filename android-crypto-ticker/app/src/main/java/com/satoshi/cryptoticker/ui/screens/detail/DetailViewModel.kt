package com.satoshi.cryptoticker.ui.screens.detail

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.satoshi.cryptoticker.data.repository.CryptoRepository
import com.satoshi.cryptoticker.data.repository.Result
import com.satoshi.cryptoticker.domain.model.Coin
import com.satoshi.cryptoticker.domain.model.PriceAlert
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

enum class ChartRange(val days: Int, val label: String) {
    DAY_7(7, "7D"), DAY_30(30, "30D"), DAY_90(90, "90D"), DAY_365(365, "1Y")
}

data class DetailUiState(
    val coin: Coin? = null,
    val chartData: List<Pair<Long, Double>> = emptyList(),
    val chartRange: ChartRange = ChartRange.DAY_7,
    val isWatched: Boolean = false,
    val isLoading: Boolean = true,
    val chartLoading: Boolean = false,
    val error: String? = null,
    val alerts: List<PriceAlert> = emptyList()
)

@HiltViewModel
class DetailViewModel @Inject constructor(
    savedState: SavedStateHandle,
    private val repo: CryptoRepository
) : ViewModel() {

    val coinId: String = savedState["coinId"] ?: ""
    private val _state = MutableStateFlow(DetailUiState())
    val state: StateFlow<DetailUiState> = _state.asStateFlow()

    init {
        loadCoin()
        loadChart(ChartRange.DAY_7)
        observeAlerts()
    }

    fun loadCoin() {
        viewModelScope.launch {
            val result = repo.getCoins(listOf(coinId))
            val isWatched = repo.isWatched(coinId)
            _state.update { s ->
                when (result) {
                    is Result.Success -> s.copy(
                        coin = result.data.firstOrNull { it.id == coinId },
                        isWatched = isWatched,
                        isLoading = false,
                        error = null
                    )
                    is Result.Error -> s.copy(isLoading = false, error = result.message)
                }
            }
        }
    }

    fun loadChart(range: ChartRange) {
        viewModelScope.launch {
            _state.update { it.copy(chartLoading = true, chartRange = range) }
            val result = repo.getMarketChart(coinId, range.days)
            _state.update { s ->
                when (result) {
                    is Result.Success -> s.copy(chartData = result.data, chartLoading = false)
                    is Result.Error -> s.copy(chartLoading = false)
                }
            }
        }
    }

    fun toggleWatchlist() {
        viewModelScope.launch {
            val coin = _state.value.coin ?: return@launch
            if (_state.value.isWatched) {
                repo.removeFromWatchlist(coinId)
                _state.update { it.copy(isWatched = false) }
            } else {
                repo.addToWatchlist(coinId, coin.symbol, coin.name)
                _state.update { it.copy(isWatched = true) }
            }
        }
    }

    fun addAlert(targetPrice: Double, isAbove: Boolean) {
        viewModelScope.launch {
            val coin = _state.value.coin ?: return@launch
            repo.addAlert(coinId, coin.name, targetPrice, isAbove)
        }
    }

    private fun observeAlerts() {
        viewModelScope.launch {
            repo.observeAlerts().collect { entities ->
                _state.update { s ->
                    s.copy(alerts = entities.filter { it.coinId == coinId }.map {
                        PriceAlert(it.id, it.coinId, it.coinName, it.targetPrice, it.isAbove)
                    })
                }
            }
        }
    }
}
