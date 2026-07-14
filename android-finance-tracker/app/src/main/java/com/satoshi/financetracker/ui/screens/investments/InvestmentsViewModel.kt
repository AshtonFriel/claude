package com.satoshi.financetracker.ui.screens.investments

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.satoshi.financetracker.data.db.entity.HoldingEntity
import com.satoshi.financetracker.data.repository.FinanceRepository
import com.satoshi.financetracker.data.repository.Result
import com.satoshi.financetracker.domain.model.Holding
import com.satoshi.financetracker.domain.model.HoldingType
import com.satoshi.financetracker.domain.model.Quote
import com.satoshi.financetracker.domain.model.SymbolMatch
import com.satoshi.financetracker.domain.model.toHolding
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class InvestmentsUiState(
    val isLoading: Boolean = true,
    val error: String? = null,
    val holdings: List<Holding> = emptyList(),
    val totalValue: Double = 0.0,
    val totalGainLoss: Double? = null,
    val totalGainLossPercent: Double? = null
)

data class SymbolSearchState(
    val query: String = "",
    val isSearching: Boolean = false,
    val results: List<SymbolMatch> = emptyList()
)

@HiltViewModel
class InvestmentsViewModel @Inject constructor(private val repo: FinanceRepository) : ViewModel() {

    private val refreshTrigger = MutableStateFlow(0)
    private val _state = MutableStateFlow(InvestmentsUiState())
    val state: StateFlow<InvestmentsUiState> = _state.asStateFlow()

    private val _searchState = MutableStateFlow(SymbolSearchState())
    val searchState: StateFlow<SymbolSearchState> = _searchState.asStateFlow()

    private var searchJob: Job? = null

    init {
        viewModelScope.launch {
            combine(repo.observeHoldings().distinctUntilChanged(), refreshTrigger) { holdings, _ -> holdings }
                .collectLatest { holdings -> recompute(holdings) }
        }
    }

    fun refresh() {
        refreshTrigger.update { it + 1 }
    }

    private suspend fun recompute(entities: List<HoldingEntity>) {
        _state.update { it.copy(isLoading = true, error = null) }

        val symbols = entities.mapNotNull { it.quoteSymbol }
        var error: String? = null
        val quotes: Map<String, Quote> = when (val result = repo.getQuotes(symbols)) {
            is Result.Success -> result.data
            is Result.Error -> {
                error = result.message
                emptyMap()
            }
        }

        val holdings = entities.map { it.toHolding(quotes) }.sortedByDescending { it.currentValue }
        val withBasis = holdings.filter { it.costBasis != null }
        val totalCost = withBasis.sumOf { it.costBasis ?: 0.0 }
        val totalGain = withBasis.takeIf { it.isNotEmpty() }
            ?.sumOf { it.gainLoss ?: 0.0 }

        _state.update { s ->
            s.copy(
                isLoading = false,
                error = error,
                holdings = holdings,
                totalValue = holdings.sumOf { it.currentValue },
                totalGainLoss = totalGain,
                totalGainLossPercent = totalGain?.takeIf { totalCost > 0 }?.let { it / totalCost * 100 }
            )
        }
    }

    fun search(query: String) {
        _searchState.update { it.copy(query = query) }
        searchJob?.cancel()
        if (query.isBlank()) {
            _searchState.update { it.copy(isSearching = false, results = emptyList()) }
            return
        }
        searchJob = viewModelScope.launch {
            delay(350)
            _searchState.update { it.copy(isSearching = true) }
            val results = when (val r = repo.searchSymbols(query.trim())) {
                is Result.Success -> r.data
                is Result.Error -> emptyList()
            }
            _searchState.update { it.copy(isSearching = false, results = results) }
        }
    }

    fun clearSearch() {
        searchJob?.cancel()
        _searchState.value = SymbolSearchState()
    }

    fun saveHolding(
        id: Long?,
        name: String,
        type: HoldingType,
        quoteSymbol: String?,
        quantity: Double,
        avgCostPerUnit: Double?,
        manualValue: Double?
    ) {
        viewModelScope.launch {
            repo.upsertHolding(
                HoldingEntity(
                    id = id ?: 0,
                    name = name,
                    type = type,
                    quoteSymbol = quoteSymbol,
                    quantity = quantity,
                    avgCostPerUnit = avgCostPerUnit,
                    manualValue = manualValue
                )
            )
        }
    }

    fun deleteHolding(id: Long) {
        viewModelScope.launch { repo.deleteHolding(id) }
    }
}
