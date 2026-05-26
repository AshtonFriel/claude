package com.satoshi.cryptoticker.ui.screens.bitcoin

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.satoshi.cryptoticker.data.repository.CryptoRepository
import com.satoshi.cryptoticker.data.repository.Result
import com.satoshi.cryptoticker.domain.model.BitcoinStats
import com.satoshi.cryptoticker.domain.model.Coin
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

data class BitcoinUiState(
    val btc: Coin? = null,
    val stats: BitcoinStats? = null,
    val isLoading: Boolean = true,
    val error: String? = null,
    val isRateLimit: Boolean = false
)

@HiltViewModel
class BitcoinViewModel @Inject constructor(private val repo: CryptoRepository) : ViewModel() {

    private val _state = MutableStateFlow(BitcoinUiState())
    val state: StateFlow<BitcoinUiState> = _state.asStateFlow()

    init {
        load()
        startAutoRefresh()
    }

    fun load() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            val coinsResult = repo.getCoins(listOf("bitcoin"))
            val statsResult = repo.getBitcoinStats()

            _state.update { s ->
                s.copy(
                    isLoading = false,
                    btc = if (coinsResult is Result.Success) coinsResult.data.firstOrNull { it.id == "bitcoin" } else s.btc,
                    stats = if (statsResult is Result.Success) statsResult.data else s.stats,
                    error = when {
                        coinsResult is Result.Error -> coinsResult.message
                        statsResult is Result.Error -> statsResult.message
                        else -> null
                    },
                    isRateLimit = coinsResult is Result.Error && coinsResult.isRateLimit
                )
            }
        }
    }

    private fun startAutoRefresh() {
        viewModelScope.launch {
            while (true) {
                delay(30_000)
                load()
            }
        }
    }
}
