package com.satoshi.cryptoticker.ui.screens.search

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.satoshi.cryptoticker.data.repository.CryptoRepository
import com.satoshi.cryptoticker.data.repository.Result
import com.satoshi.cryptoticker.data.repository.SearchCoin
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import javax.inject.Inject

data class SearchUiState(
    val query: String = "",
    val results: List<SearchCoin> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class SearchViewModel @Inject constructor(private val repo: CryptoRepository) : ViewModel() {

    private val _state = MutableStateFlow(SearchUiState())
    val state: StateFlow<SearchUiState> = _state.asStateFlow()
    private var searchJob: Job? = null

    fun onQueryChange(query: String) {
        _state.update { it.copy(query = query) }
        searchJob?.cancel()
        if (query.isBlank()) {
            _state.update { it.copy(results = emptyList(), isLoading = false) }
            return
        }
        searchJob = viewModelScope.launch {
            delay(400)
            _state.update { it.copy(isLoading = true, error = null) }
            val result = repo.searchCoins(query)
            _state.update { s ->
                when (result) {
                    is Result.Success -> s.copy(results = result.data, isLoading = false)
                    is Result.Error -> s.copy(isLoading = false, error = result.message)
                }
            }
        }
    }

    fun addToWatchlist(coin: SearchCoin) {
        viewModelScope.launch {
            repo.addToWatchlist(coin.id, coin.symbol, coin.name)
        }
    }
}
